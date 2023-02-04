import Route from "../Route";
import {Request, Response} from "express";
import {badRequest, checkNaN, checkUndefinedParams, internalServerError, success} from "../helper/http";
import {CPMS} from "../model/CPMS";
import {getReqHttp, StandardResponse} from "../helper/misc";
import logger from "../helper/logger";
import CPMSAuthentication from "../helper/CPMSAuthentication";
import {AxiosError, AxiosResponse} from "axios";

export default class CSDetails extends Route {

    constructor() {
        super("details", true);
    }

    /**
     * Allows a logged in client to recover the external and part of the internal information regarding a CS.
     *
     * @param request must contain: stationID, cpmsId
     * @param response stationData as a Record<string, Object> where Object contains all the data of a CS provided by its CPMS.
     * @protected
     */
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
            internalServerError(response, "Could not find the CPMS");
            return;
        }
        if (!ownerCPMS) {
            badRequest(response, "Owner CPMS could not be found");
            return;
        }

        //Check CPMS authentication and authenticate if needed
        ownerCPMS = await CPMSAuthentication.getTokenIfNeeded(ownerCPMS);

        const axiosResponseRaw = await getReqHttp(ownerCPMS.endpoint + "/cs-list", ownerCPMS.token, {
            CSID: stationID
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

        if (axiosResponse?.data.data.CSList == undefined) {
            badRequest(response, "Invalid stationID provided");
            return;
        }

        // Responds with both the details of the CS and its available time slots!
        const csRecord: Record<string, unknown> = axiosResponse?.data.data.CSList as any;
        csRecord.ownerCPMSName = ownerCPMS.name;
        csRecord.ownerCPMSId = ownerCPMS.id;
        success(response, {
            stationData: csRecord,
        });
    }
}
