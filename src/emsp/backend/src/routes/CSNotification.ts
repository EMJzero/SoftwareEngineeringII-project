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

export default class CSNotification extends Route {

    constructor() {
        super("cs-notification", false);
    }

    /**
     * Allows a logged in client to recover the external and part of the internal information regarding a CS.
     *
     * @param request must contain: stationID, cpmsId
     * @param response stationData as a Record<string, Object> where Object contains all the data of a CS provided by its CPMS.
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

        //Bill the user
        const user = await Booking.findUserWithActive(csId, ownerCPMS.id, socketId);
        console.log("BILLING USER ", user?.username, "AMOUNT", totalBillableAmount);
        //Add a notification - frontend will query them to display
        if (user?.id) {
            try {
                await Notification.registerNotification(user.id, "Your recharge at \"" + csName + "\" ended, and you've been charged $" + totalBillableAmount);
            } catch (e) {
                logger.log(e);
            }
        }

        success(response);
    }
}