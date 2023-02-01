import Route from "../Route";
import { Request, Response } from "express";
import { checkUndefinedParams, internalServerError, success } from "../helper/http";
import { CPMS } from "../model/CPMS";
import { getReqHttp } from "../helper/misc";
import logger from "../helper/logger";
import { stat } from "fs";
import CPMSAuthentication from "../helper/CPMSAuthentication";

export default class SearchCSRoute extends Route {

    constructor() {
        super("search", true);
    }

    protected async httpGet(request: Request, response: Response): Promise<void> {
        const userID = request.userId;
        const filterLatitude = request.query.latitude as string;
        const filterLongitude = request.query.longitude as string;
        const filterRadius = request.query.radius as (string | undefined);
        const priceLowerBound = request.query.priceMin as (string | undefined);
        const priceUpperBound = request.query.priceMax as (string | undefined);

        if (checkUndefinedParams(response, filterLatitude, filterLongitude)) {
            return;
        }

        let allCPMS;
        try {
            allCPMS = await CPMS.findAll();
        } catch (e) {
            logger.error("DB access to find all CPMSs failed");
            internalServerError(response);
            return;
        }

        const stations = [];
        for (let cpms of allCPMS) {
            cpms = await CPMSAuthentication.getTokenIfNeeded(cpms);

            const axiosResponse = await getReqHttp(cpms.endpoint + "/cs-list", cpms.token, {
                locationLatitude: filterLatitude,
                locationLongitude: filterLongitude,
                locationRange: filterRadius,
                priceLowerBound,
                priceUpperBound
            });

            if(axiosResponse == null) {
                internalServerError(response);
                return;
            }

            const responseCS = axiosResponse?.data.data.CSList as any[];
            const resultCSes = responseCS.map((cs) => {
                const csRecord: Record<string, unknown> = cs;
                csRecord.ownerCPMSName = cpms.name;
                csRecord.ownerCPMSId = cpms.id;
                return csRecord;
            });
            for (const resultCS of resultCSes) {
                stations.push(resultCS);
            }
        }
        success(response, stations);
    }
}
