import Route from "../Route";
import {Request, Response} from "express";
import {badRequest, checkNaN, checkUndefinedParams, internalServerError, success} from "../helper/http";
import {CPMS} from "../model/CPMS";
import {getReqHttp} from "../helper/misc";
import logger from "../helper/logger";
import CPMSAuthentication from "../helper/CPMSAuthentication";
import {User} from "../model/User";
import {Booking} from "../model/Booking";
import {use} from "chai";
import {Notification} from "../model/Notification";
import Authentication from "../helper/authentication";

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

        console.log(ownerCPMS.id, csId, socketId);
        //Bill the user
        const user = await Booking.findUserWithActive(csId, ownerCPMS.id, socketId);
        console.log("BILLING USER ", user?.user.username, "AMOUNT", totalBillableAmount);
        //Add a notification - frontend will query them to display
        if (user?.user.id) {
            try {
                await Notification.registerNotification(user.user.id, "Your recharge at \"" + csName + "\" ended, and you've been charged $" + totalBillableAmount);
                await Booking.deleteBooking(user.user.id, user.bookingId);
            } catch (e) {
                logger.log(e);
            }
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
}
