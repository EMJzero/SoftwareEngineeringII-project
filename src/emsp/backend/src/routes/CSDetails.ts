import Route from "../Route";
import { Request, Response } from "express";
import { badRequest, checkNaN, checkUndefinedParams, internalServerError, success } from "../helper/http";
import { CPMS } from "../model/CPMS";
import { getReqHttp } from "../helper/misc";
import logger from "../helper/logger";
import { Booking } from "../model/Booking";

export default class CSDetails extends Route {

    constructor() {
        super("details", true);
    }

    protected async httpGet(request: Request, response: Response): Promise<void> {
        const userID = request.userId;
        const stationID = request.query.stationID as string;
        const cpmsId = parseInt(request.query.cpmsId as string);

        if (checkUndefinedParams(response, stationID) || checkNaN(response, cpmsId)) {
            return;
        }

        let ownerCPMS;
        try {
            ownerCPMS = await CPMS.findById(cpmsId);
        } catch (e) {
            logger.error("DB access for CPMSs failed");
            internalServerError(response);
            return;
        }
        if (!ownerCPMS) {
            badRequest(response, "Owner CPMS could not be found");
            return;
        }

        const axiosResponse = await getReqHttp(ownerCPMS.endpoint + "/cs-list", null, {
            CSID: stationID
        });

        if(axiosResponse == null) {
            internalServerError(response);
            return;
        }

        if (axiosResponse?.data.data.CSList == undefined) {
            badRequest(response, "Invalid stationID provided");
            return;
        }

        // Responds with both the details of the CS and its available time slots!
        success(response, {
            stationData: axiosResponse?.data.data.CSList,
            availableTimeSlots: await Booking.getAvailableTimeSlots(ownerCPMS.id, parseInt(stationID))
        });
    }
}
