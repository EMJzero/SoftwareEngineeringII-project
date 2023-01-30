import Route from "../Route";
import { Request, Response } from "express";
import { badRequest, checkNaN, checkUndefinedParams, internalServerError, success } from "../helper/http";
import { CPMS } from "../model/CPMS";
import { getReqHttp } from "../helper/misc";
import logger from "../helper/logger";
import { Booking } from "../model/Booking";
import env from "../helper/env";

export default class Bookings extends Route {

    constructor() {
        super("bookings", true);
    }

    // Query for existing bookings
    protected async httpGet(request: Request, response: Response): Promise<void> {
        const userID = request.userId;
        const referenceDateDay = parseInt(request.query.referenceDateDay as string);
        const referenceDateMonth = parseInt(request.query.referenceDateMonth as string);
        const referenceDateYear = parseInt(request.query.referenceDateYear as string);
        const intervalDays = parseInt(request.query.intervalDays as string);
        const retrieveActiveBooking = request.query.retrieveActiveBooking;

        try {
            if (retrieveActiveBooking != undefined) {
                success(response, await Booking.findActiveByUser(userID));
            } else if (!isNaN(referenceDateDay)) {
                const referenceDate = new Date(referenceDateYear, referenceDateMonth, referenceDateDay);
                if (checkNaN(response, referenceDateDay, referenceDateMonth, referenceDateYear, intervalDays)) return;
                success(response, await Booking.findByUserFiltered(userID, referenceDate, intervalDays));
            } else {
                success(response, await Booking.findByUser(userID));
            }
        } catch (e) {
            logger.error("DB access for Booking failed");
            internalServerError(response);
        }
    }

    // To delete a booking
    protected async httpDelete(request: Request, response: Response): Promise<void>{
        const userID = request.userId;
        const bookingID = request.body.bookingId as number;

        if (checkUndefinedParams(response, bookingID)) return;

        if(await Booking.deleteBooking(userID, bookingID)) {
            success(response, {
                result: "ok"
            });
        } else {
            badRequest(response, "No booking found with given Id");
        }
    }

    // To create a new booking
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
        }

        let ownerCPMS;
        try {
            ownerCPMS = await CPMS.findById(cpmsID);
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
            const axiosResponse = await getReqHttp(ownerCPMS.endpoint + "/cs-list", null, {
                CSID: csID
            });

            if(axiosResponse?.data.data.CSList == undefined)
                badRequest(response, "Invalid csID");
        } catch (e) {
            logger.error("Axios call to" + ownerCPMS.endpoint + " failed with error" + e);
            internalServerError(response);
        }

        if(await Booking.createBooking(userID, startDate, endDate, cpmsID, csID, socketID)) {
            success(response, {
                result: "ok"
            });
        } else {
            badRequest(response, "Booking creation failed, likely another booking exist within the specified time slot");
        }
    }
}
