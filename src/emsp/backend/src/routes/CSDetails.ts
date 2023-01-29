import Route from "../Route";
import { Request, Response } from "express";
import { badRequest, checkUndefinedParams, internalServerError, success } from "../helper/http";
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
        const cpmsName = request.query.cpmsName as string;

        if (checkUndefinedParams(response, stationID, cpmsName)) {
            return;
        }

        let ownerCPMS;
        try {
            ownerCPMS = await CPMS.findByName(cpmsName);
        } catch (e) {
            logger.log("DB access for CPMSs failed");
            internalServerError(response);
            return;
        }
        if (!ownerCPMS) {
            badRequest(response, "Owner CPMS could not be found");
            return;
        }

        try {
            const axiosResponse = await getReqHttp(ownerCPMS.endpoint + "/cs-list", null, {
                CSID: stationID
            });

            if(JSON.parse(axiosResponse?.data.data).CSList == undefined) {
                badRequest(response, "Invalid stationID provided");
            }

            // Responds with both the details of the CS and its available time slots!
            success(response, {
                stationData: JSON.parse(axiosResponse?.data.data).CSList,
                availableTimeSlots: Booking.getAvailableTimeSlots(ownerCPMS.id, parseInt(stationID))
            });
        } catch (e) {
            logger.log("Axios call to" + ownerCPMS.endpoint + "failed with error" + e);
            internalServerError(response);
        }
    }
}
