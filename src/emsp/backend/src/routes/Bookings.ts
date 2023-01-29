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

        if(retrieveActiveBooking != undefined) {
            success(response, await Booking.findActiveByUser(userID));
        } else if(!isNaN(referenceDateDay)) {
            const referenceDate = new Date(referenceDateYear, referenceDateMonth, referenceDateDay);
            if (checkNaN(response, referenceDateDay, referenceDateMonth, referenceDateYear, intervalDays)) return;
            success(response, await Booking.findByUserFiltered(userID, referenceDate, intervalDays));
        } else {
            success(response, await Booking.findByUser(userID));
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
        const startDateDay = request.body.startDateDay as number;
        const startDateMonth = request.body.startDateMonth as number;
        const startDateYear = request.body.startDateYear as number;
        const endDateDay = request.body.endDateDay as number;
        const endDateMonth = request.body.endDateMonth as number;
        const endDateYear = request.body.endDateYear as number;
        const cpmsID = request.body.cpmsID as number;
        const csID = request.body.csID as number;
        const socketID = request.body.socketID as number;

        if (checkUndefinedParams(response, startDateDay, startDateMonth, startDateYear, endDateDay, endDateMonth, endDateYear, cpmsID, csID, socketID)) return;

        const startDate = new Date(startDateYear, startDateMonth, startDateDay);
        const endDate = new Date(endDateYear, endDateMonth, endDateDay);

        const tmpDate = new Date(startDateYear, startDateMonth, startDateDay);
        tmpDate.setMinutes(tmpDate.getMinutes() + env.TIME_SLOT_SIZE);
        if(tmpDate > endDate) {
            badRequest(response, "Invalid dates, minimum timeslot size of " + env.TIME_SLOT_SIZE + "min violated");
            return;
        }

        const ownerCPMS = await CPMS.findById(cpmsID);
        if (!ownerCPMS) {
            badRequest(response, "Owner CPMS could not be found");
            return;
        }

        try {
            const axiosResponse = await getReqHttp(ownerCPMS.endpoint + "/cs-list", null, {
                CSID: csID
            });

            if(JSON.parse(axiosResponse?.data.data).CSList == undefined)
                badRequest(response, "Invalid csID");
        } catch (e) {
            logger.log("Axios call to" + ownerCPMS.endpoint + "failed with error" + e);
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
