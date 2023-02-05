import Route from "../Route";
import {Request, Response} from "express";
import {badRequest, checkNaN, checkUndefinedParams, internalServerError, success} from "../helper/http";
import {CPMS} from "../model/CPMS";
import {getReqHttp, postReqHttp} from "../helper/misc";
import logger from "../helper/logger";
import CPMSAuthentication from "../helper/CPMSAuthentication";
import {IUser, User} from "../model/User";
import {Booking} from "../model/Booking";
import {use} from "chai";
import {Notification} from "../model/Notification";
import Authentication from "../helper/authentication";
import env from "../helper/env";

export default class CSNotification extends Route {

    constructor() {
        super("cs-notification", false);
    }

    /**
     * Allows the frontend to retrieve all notifications for a user
     * @param request must be authenticated
     * @param response the list of notifications
     * @protected
     */
    protected async httpGet(request: Request, response: Response): Promise<void> {
        const isAuthenticated = Authentication.authenticateRequest(request, response);
        if (!isAuthenticated) return;

        const userId = request.userId;
        try {
            const notifications = await Notification.findByUser(userId);
            success(response, notifications);
        } catch (e) {
            logger.error("Could not find notifications: " + e);
            internalServerError(response, "Could not find notifications");
        }
    }

    /**
     * Allows the CPMS to notify the eMSP of a finished charge.
     *
     * @param request must contain: cpmsName, csId, csName, socketId, totalBillableAmount
     * @param response
     * @protected
     */
    protected async httpPost(request: Request, response: Response): Promise<void> {
        const cpmsName = request.body.issuerCPMSName as string;
        const csId = request.body.affectedCSId;
        const csName = request.body.affectedCSName;
        const socketId = request.body.affectedSocketId;
        const totalBillableAmount = request.body.totalBillableAmount;

        if (checkUndefinedParams(response, cpmsName, csName) || checkNaN(response, csId, socketId)) {
            return;
        }

        let ownerCPMS;
        try {
            ownerCPMS = await CPMS.findByName(cpmsName);
        } catch (e) {
            logger.error("DB access for CPMSs failed");
            internalServerError(response);
            return;
        }
        if (!ownerCPMS) {
            badRequest(response, "Owner CPMS could not be found");
            return;
        }

        try {
            //Bill the user
            const user = await Booking.findUserWithActive(csId, ownerCPMS.id, socketId);
            //Add a notification - frontend will query them to display
            if (user) {
                await CSNotification.billUser(user.user, totalBillableAmount, csName);
                await Booking.deleteBooking(user.user.id, user.bookingId);
            }
        } catch (e) {
            logger.error("Error: " + e);
            internalServerError(response, "Could not finalize notification handling");
            return;
        }

        success(response);
    }

    /**
     * Allows the frontend to delete all notifications of a user
     * @param request The authenticated request
     * @param response
     * @protected
     */
    protected async httpDelete(request: Request, response: Response): Promise<void> {
        const isAuthenticated = Authentication.authenticateRequest(request, response);
        if (!isAuthenticated) return;

        const userId = request.userId;
        try {
            await Notification.clearNotifications(userId);
            success(response);
        } catch (e) {
            logger.error("Could not clear notifications: " + e);
            internalServerError(response, "Could not clear notifications");
        }
    }

    static async billUser(user: IUser, totalBillableAmount: number, stationName: number | undefined) {
        const response = await postReqHttp(env.PAYMENT_PROVIDER_URL, null, {
            cardNumber: user.creditCardNumber,
            cardOwner: user.creditCardBillingName,
            cvv: user.creditCardCVV,
            expiration: user.creditCardExpiration,
            billable: totalBillableAmount,
            command: "BILL"
        });

        const message = stationName ? "Your recharge at \"" + stationName + "\" ended, and you've been charged $" + totalBillableAmount : "You were fined for expired booking. The fine amount was $" + totalBillableAmount;
        await Notification.registerNotification(user.id, message);
    }
}
