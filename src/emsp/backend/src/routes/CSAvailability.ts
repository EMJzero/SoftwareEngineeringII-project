import Route from "../Route";
import { Request, Response } from "express";
import { badRequest, checkNaN, checkUndefinedParams, internalServerError, success } from "../helper/http";
import { CPMS } from "../model/CPMS";
import logger from "../helper/logger";
import { Booking } from "../model/Booking";

export default class CSDetails extends Route {

    constructor() {
        super("cs-availability", true);
    }

    protected async httpGet(request: Request, response: Response): Promise<void> {
        const userID = request.userId;
        const stationID = parseInt(request.query.stationID as string);
        const socketID = parseInt(request.query.socketID as string);
        const cpmsID = parseInt(request.query.cpmsID as string);
        const referenceDateDay = parseInt(request.query.referenceDateDay as string);
        const referenceDateMonth = parseInt(request.query.referenceDateMonth as string);
        const referenceDateYear = parseInt(request.query.referenceDateYear as string);

        if (checkNaN(response, stationID, socketID, cpmsID, referenceDateYear, referenceDateMonth, referenceDateDay)) {
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

        const startDate = new Date(referenceDateYear, referenceDateMonth, referenceDateDay);
        const endDate = new Date(referenceDateYear, referenceDateMonth, referenceDateDay);
        endDate.setDate(endDate.getDate() + 1);

        // Responds with both the details of the CS and its available time slots!
        try {
            success(response, Booking.getAvailableTimeSlots(ownerCPMS.id, stationID, socketID, startDate, endDate));
        } catch (e) {
            internalServerError(response);
            return;
        }
    }
}
