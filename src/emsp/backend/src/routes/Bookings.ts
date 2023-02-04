import Route from "../Route";
import { Request, Response } from "express";
import { badRequest, checkNaN, checkUndefinedParams, internalServerError, success } from "../helper/http";
import { CPMS } from "../model/CPMS";
import {getReqHttp, StandardResponse} from "../helper/misc";
import logger from "../helper/logger";
import { Booking } from "../model/Booking";
import env from "../helper/env";
import CPMSAuthentication from "../helper/CPMSAuthentication";
import {AxiosError, AxiosResponse} from "axios";

export default class Bookings extends Route {

    constructor() {
        super("bookings", true);
    }

    // Query for existing bookings
    /**
     * Allows a logged in client to recover their bookings, and narrow down their query by using some filters.
     *
     * @param request can contain: referenceDateDay, referenceDateMonth, referenceDateYear, intervalDays, retrieveActiveBooking
     * @param response an array of {@link Booking}
     * @protected
     */
    protected async httpGet(request: Request, response: Response): Promise<void> {
        const userID = request.userId;
        const referenceDateDay = parseInt(request.query.referenceDateDay as string);
        const referenceDateMonth = parseInt(request.query.referenceDateMonth as string);
        const referenceDateYear = parseInt(request.query.referenceDateYear as string);
        const intervalDays = parseInt(request.query.intervalDays as string);
        const retrieveActiveBooking = request.query.retrieveActiveBooking;

        try {
            if (retrieveActiveBooking != undefined) {
                const result = await Booking.findActiveByUser(userID)
                success(response, result);
            } else if (!isNaN(referenceDateDay)) {
                const referenceDate = new Date(referenceDateYear, referenceDateMonth, referenceDateDay);
                if (checkNaN(response, referenceDateDay, referenceDateMonth, referenceDateYear, intervalDays)) return;
                const result = await Booking.findByUserFiltered(userID, referenceDate, intervalDays)
                success(response, result);
            } else {
                const result = await Booking.findByUser(userID)
                success(response, result);
            }
        } catch (e) {
            logger.error("DB access for Booking failed");
            internalServerError(response, "Could not retrieve bookings");
        }
    }

    // To delete a booking
    /**
     * Allows a logged in client to delete on of their booking.
     *
     * @param request must contain: bookingId
     * @param response the HTTP status code and message of the response can be used to infer the success or failure of the operation
     * @protected
     */
    protected async httpDelete(request: Request, response: Response): Promise<void>{
        const userID = request.userId;
        const bookingID = request.body.bookingId as number;

        if (checkUndefinedParams(response, bookingID)) return;

        try {
            if (await Booking.deleteBooking(userID, bookingID)) {
                success(response, {
                    result: "ok"
                });
            } else {
                badRequest(response, "No booking found with given Id");
            }
        } catch (e) {
            internalServerError(response, "Booking deletion failed");
        }
    }

    // To create a new booking
    /**
     * Allows a logged in client to create a new booking by providing its specifications as the CPMS, CS and socket, plus the time
     * interval.
     *
     * @param request must contain: userId, startUnixTime, endUnixTime, cpmsID, csID, socketID
     * @param response the HTTP status code and message of the response can be used to infer the success or failure of the operation     * @protected
     */
    protected async httpPost(request: Request, response: Response): Promise<void>{
        const userID = request.userId;
        const startUnixTime = request.body.startUnixTime as number;
        const endUnixTime = request.body.endUnixTime as number;
        const cpmsID = request.body.cpmsID as number;
        const csID = request.body.csID as number;
        const socketID = request.body.socketID as number;

        if (checkUndefinedParams(response, startUnixTime, endUnixTime, cpmsID, csID, socketID)) return;

        const startDate = new Date(startUnixTime);
        const endDate = new Date(endUnixTime);

        const tmpDate = new Date(startUnixTime);
        tmpDate.setMinutes(tmpDate.getMinutes() + env.TIME_SLOT_SIZE);
        if(tmpDate > endDate) {
            badRequest(response, "Invalid dates, minimum timeslot size of " + env.TIME_SLOT_SIZE + "min violated");
            return;
        } else if(endDate.valueOf() - startDate.valueOf() > 24*60*60*1000) {
            badRequest(response, "Invalid dates, maximum timeslot available is 1 day");
            return;
        } else if (startDate < new Date()) {
            badRequest(response, "You cannot create a booking in the past!");
            return;
        }

        let ownerCPMS;
        try {
            ownerCPMS = await CPMS.findById(cpmsID);
        } catch (e) {
            logger.error("DB access for CPMSs failed");
            internalServerError(response, "Could not find the CPMS");
            return;
        }

        if (!ownerCPMS) {
            badRequest(response, "Owner CPMS could not be found");
            return;
        }

        ownerCPMS = await CPMSAuthentication.getTokenIfNeeded(ownerCPMS);

        const axiosResponseRaw = await getReqHttp(ownerCPMS.endpoint + "/cs-list", ownerCPMS.token, {
            CSID: csID
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

        if(axiosResponse?.data.data.CSList == undefined) {
            badRequest(response, "Invalid station ID");
            return;
        }

        try {
            if (await Booking.createBooking(userID, startDate, endDate, cpmsID, csID, socketID)) {
                success(response, {
                    result: "ok"
                });
            } else {
                badRequest(response, "Booking creation failed, likely another booking exist within the specified time slot");
            }
        } catch (e) {
            logger.error(e);
            internalServerError(response, "Booking creation failed");
        }
    }
}
