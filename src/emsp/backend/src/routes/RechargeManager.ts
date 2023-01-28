import Route from "../Route";
import { Request, Response } from "express";
import { badRequest, checkNaN, checkUndefinedParams, internalServerError, success } from "../helper/http";
import { CPMS } from "../model/CPMS";
import { getReqHttp } from "../helper/misc";
import logger from "../helper/logger";
import { Booking } from "../model/Booking";

export default class Bookings extends Route {

    constructor() {
        super("recharge-manager", true);
    }

    // Provides the status of a CS for the active booking, if any
    protected async httpGet(request: Request, response: Response): Promise<void> {
        const userID = request.userId;

        const activeBooking = await Booking.findActiveByUser(userID);
        if(activeBooking == null) {
            badRequest(response, "No currently active booking");
            return;
        }

        const ownerCPMS = await CPMS.findById(activeBooking.cpmsId);
        if (!ownerCPMS) {
            internalServerError(response);
            return;
        }

        try {
            const axiosResponse = await getReqHttp(ownerCPMS.endpoint + "/cs-list", null, {
                CSID: activeBooking.csId,
                socketID: activeBooking.socketId
            });

            if(axiosResponse?.status != 200) {
                badRequest(response, "Invalid csID or socketID for the given cpms");
                return;
            }

            const parsedResponse = JSON.parse(axiosResponse?.data);

            success(response, {
                csID: activeBooking.csId,
                socketID: activeBooking.socketId,
                state: parsedResponse.state,
                currentPower: parsedResponse.currentPower,
                maxPower: parsedResponse.maxPower,
                connectedCar: parsedResponse.connectedCar,
                estimatedTimeRemaining: parsedResponse.estimatedTimeRemaining
            });
        } catch (e) {
            logger.log("Axios call to" + ownerCPMS.endpoint + "failed with error" + e);
            internalServerError(response);
        }
    }

    // Start/Stop charging process
    protected async httpPost(request: Request, response: Response): Promise<void>{
        const userID = request.userId;

        const currentBooking = await Booking.findCurrentByUser(userID);
        if(currentBooking == null) {
            badRequest(response, "You have no booking for the current time frame");
            return;
        }

        //TODO...
    }
}
