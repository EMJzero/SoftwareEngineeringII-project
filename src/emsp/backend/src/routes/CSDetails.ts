import Route from "../Route";
import { Request, Response } from "express";
import { badRequest, checkUndefinedParams, internalServerError, success } from "../helper/http";
import { CPMS } from "../model/CPMS";
import { getReqHttp } from "../helper/misc";
import logger from "../helper/logger";

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

        const ownerCPMS = await CPMS.findByName(cpmsName);
        if (!ownerCPMS) {
            badRequest(response, "Owner CPMS could not be found");
            return;
        }

        try {
            const axiosResponse = await getReqHttp(ownerCPMS.endpoint + "/cs-list", null, {
                CSID: stationID
            });
            success(response, {
                stationData: JSON.parse(axiosResponse?.data).CSList
            });
        } catch (e) {
            logger.log("Axios call to" + ownerCPMS.endpoint + "failed with error" + e);
            internalServerError(response);
        }
    }
}
