import Route from "../Route";
import { Request, Response } from "express";
import {checkUndefinedParams, success} from "../helper/http";
import {CPMS} from "../model/CPMS";
import {getReqHttp} from "../helper/misc";
import logger from "../helper/logger";

export default class SearchCSRoute extends Route {

    constructor() {
        super("search", true);
    }

    protected async httpGet(request: Request, response: Response): Promise<void> {
        const userID = request.userId;
        const filterLatitude = request.query.latitude as string;
        const filterLongitude = request.query.longitude as string;
        const filterRadius = request.query.radius as (string | undefined);

        if (checkUndefinedParams(response, filterLatitude, filterLongitude)) {
            return;
        }

        const allCPMS = await CPMS.findAll();
        let stations = [];
        for (const cpms of allCPMS) {
            try {
                const axiosResponse = await getReqHttp(cpms.endpoint + "/cs-list", null, {
                    locationLatitude: filterLatitude,
                    locationLongitude: filterLongitude,
                    locationRange: filterRadius
                })
                const responseCS = JSON.parse(axiosResponse?.data).CSList as unknown[];
                stations.push(responseCS);
            } catch (e) {
                logger.log("Axios call to" + cpms.endpoint + "failed with error" + e);
            }
        }

        success(response, {
            retrievedStations: stations
        })
    }
}
