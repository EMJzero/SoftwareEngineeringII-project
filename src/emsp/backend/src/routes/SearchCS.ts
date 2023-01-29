import Route from "../Route";
import { Request, Response } from "express";
import { checkUndefinedParams, success } from "../helper/http";
import { CPMS } from "../model/CPMS";
import { getReqHttp } from "../helper/misc";
import logger from "../helper/logger";
import {stat} from "fs";

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

        const allCPMS = await CPMS.findAll();
        const stations = [];
        for (const cpms of allCPMS) {
            try {
                const axiosResponse = await getReqHttp(cpms.endpoint + "/cs-list", null, {
                    locationLatitude: filterLatitude,
                    locationLongitude: filterLongitude,
                    locationRange: filterRadius,
                    priceLowerBound,
                    priceUpperBound
                });
                const responseCS = axiosResponse?.data.data.CSList as any[];
                stations.push(responseCS.map((cs) => {
                    const csRecord: Record<string, unknown> = cs;
                    csRecord.ownerCPMS = cpms.name;
                    csRecord.ownerCPMSId = cpms.id;
                    return csRecord;
                }));
            } catch (e) {
                logger.log("Axios call to" + cpms.endpoint + "failed with error" + e);
            }
        }
        success(response, stations);
    }
}
