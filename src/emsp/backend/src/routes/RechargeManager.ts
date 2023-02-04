import Route from "../Route";
import { Request, Response } from "express";
import { badRequest, checkUndefinedParams, internalServerError, success } from "../helper/http";
import { CPMS } from "../model/CPMS";
import {getReqHttp, postReqHttp, StandardResponse} from "../helper/misc";
import logger from "../helper/logger";
import { Booking } from "../model/Booking";
import {use} from "chai";
import CPMSAuthentication from "../helper/CPMSAuthentication";
import {AxiosError, AxiosResponse} from "axios";

export default class RechargeManager extends Route {

    constructor() {
        super("recharge-manager", true);
    }

    // Provides the status of a CS for the active booking, if any
    /**
     * Allows a logged in client to recover the internal status of the CS's socket with which they
     * are currently performing a recharge (the "active socket for the current booking").
     *
     * @param request simple HTTP get
     * @param response an object of the form {
     *             csID,
     *             socketID,
     *             state,
     *             currentPower,
     *             maxPower,
     *             connectedCar,
     *             estimatedTimeRemaining
     *         }
     * @protected
     */
    protected async httpGet(request: Request, response: Response): Promise<void> {
        const userID = request.userId;

        let activeBooking, ownerCPMS;
        try {
            activeBooking = await Booking.findActiveByUser(userID);
            if (activeBooking == null) {
                badRequest(response, "No currently active booking");
                return;
            }

            ownerCPMS = await CPMS.findById(activeBooking.cpmsId);
            if (!ownerCPMS) {
                internalServerError(response, "Cannot find the owner CPMS");
                return;
            }
        } catch (e) {
            logger.error("DB access for Booking failed");
            internalServerError(response, "Cannot find the owner CPMS");
            return;
        }

        ownerCPMS = await CPMSAuthentication.getTokenIfNeeded(ownerCPMS);

        const axiosResponseRaw = await getReqHttp(ownerCPMS.endpoint + "/cs-list", ownerCPMS.token, {
            CSID: activeBooking.csId,
            socketID: activeBooking.socketId
        });

        if (axiosResponseRaw.isError) {
            const message = ((axiosResponseRaw.res as AxiosError).response?.data as StandardResponse<Object>)?.message;
            internalServerError(response, message ?? "Internal server error");
            return;
        }

        const axiosResponse = axiosResponseRaw.res as AxiosResponse;

        if(axiosResponse?.status != 200) {
            badRequest(response, "Invalid csID or socketID for the given CPMS");
            return;
        }

        if (axiosResponse == null) {
            internalServerError(response, "Could not contact the CPMS");
            return;
        }

        const parsedResponse = axiosResponse?.data.data;

        success(response, {
            csID: activeBooking.csId,
            socketID: activeBooking.socketId,
            state: parsedResponse.state,
            currentPower: parsedResponse.currentPower,
            maxPower: parsedResponse.maxPower,
            connectedCar: parsedResponse.connectedCar,
            estimatedTimeRemaining: parsedResponse.estimatedTimeRemaining
        });
    }

    // Start/Stop charging process
    // BookingID can be omitted as a required parameter here, but it is better to require it in order to force the client to know which booking it is getting activated
    /**
     * Allows a logged in client to start or stop their ongoing charge.
     * Returns error an error if no charge is currently ongoing.
     *
     * @param request must contain: bookingId, action (either "start" or "stop")
     * @param response the HTTP status code and message of the response can be used to infer the success or failure of the operation     * @protected
     */
    protected async httpPost(request: Request, response: Response): Promise<void>{
        const userID = request.userId;
        const bookingID = request.body.bookingId as number;
        // Valid values: startCharge = "start", stopCharge = "stop"
        const action = request.body.action;

        if (checkUndefinedParams(response, bookingID, action)) return;

        let booking;
        try {
            booking = await Booking.findCurrentByUser(userID);
        } catch (e) {
            logger.error("DB access for Bookings failed");
            internalServerError(response);
            return;
        }

        if(booking == null || booking.id != bookingID) {
            badRequest(response, "Invalid booking Id");
            return;
        }

        let ownerCPMS;
        try {
            ownerCPMS = await CPMS.findById(booking.cpmsId);
        } catch (e) {
            logger.error("DB access for CPMSs failed");
            internalServerError(response);
            return;
        }
        if (!ownerCPMS) {
            internalServerError(response);
            return;
        }

        ownerCPMS = await CPMSAuthentication.getTokenIfNeeded(ownerCPMS);

        const axiosResponseRaw = await postReqHttp(ownerCPMS.endpoint + "/recharge-manager", ownerCPMS.token, {
            CSID: booking.csId,
            socketID: booking.socketId,
            maximumTimeoutDate: booking.endDate,
            action: action
        });

        if (axiosResponseRaw.isError) {
            const message = ((axiosResponseRaw.res as AxiosError).response?.data as StandardResponse<Object>)?.message;
            internalServerError(response, message ?? "Internal server error");
            return;
        }

        const axiosResponse = axiosResponseRaw.res as AxiosResponse;

        if(axiosResponse == null) {
            internalServerError(response);
            return;
        }

        const parsedResponse = axiosResponse?.data.data;

        if(axiosResponse?.status != 200) {
            badRequest(response, parsedResponse);
            return;
        }

        if(action == "start") {
            try {
                if(!await Booking.activateBooking(userID, bookingID))
                    throw "Booking activation failed...";
            } catch (e) {
                logger.error("DB access for Booking failed");
                internalServerError(response, "Could not access your Bookings");
                return;
            }
        }/* else {
        //Notifications will handle booking deletion automatically!
            try {
                if(!await Booking.deleteBooking(userID, bookingID))
                    throw "Booking deletion failed...";
            } catch (e) {
                logger.error("DB access for Booking failed");
                internalServerError(response, "Could not access your Bookings");
                return;
            }
        }*/

        booking.isActive = action == "start";
        success(response, booking);
    }
}
