import { badRequest, checkNaN, success } from "../helper/http";
import Route from "../Route";
import { Request, Response } from "express";
import { CS } from "../model/CS";
import logger from "../helper/logger";

export default class CSListRoute extends Route {
    constructor() {
        super("cs-list", false);
    }

    protected async httpGet(request: Request, response: Response): Promise<void> {
        const CSID: number = parseInt(request.query.CSID as string);

        if (!CSID) {
            const locationLatitude: number = parseFloat(request.query.locationLatitude as string);
            const locationLongitude: number = parseFloat(request.query.locationLongitude as string);
            const locationRange: number = parseFloat(request.query.locationRange as string);
            const priceLowerBound: number = parseFloat(request.query.priceLowerBound as string);
            const priceUpperBound: number = parseFloat(request.query.priceUpperBound as string);

            if (checkNaN(response, locationLatitude, locationLongitude, locationRange, priceLowerBound, priceUpperBound)) return;

            let error  = "";
            if (locationLatitude < -90 || locationLatitude > 90)
                error += "\nInvalid latitude";
            if (locationLongitude < -180 || locationLongitude > 180)
                error += "\nInvalid longitude";
            if (locationRange < 0)
                error += "\nInvalid location range";
            if (priceLowerBound < 0 || priceUpperBound < priceUpperBound)
                error += "\nInvalid price range";
            if (error != "") {
                badRequest(response, "Errors:" + error);
                return;
            }
            success(response, {
                CSList: await CS.getCSList(locationLatitude, locationLongitude, locationRange, priceLowerBound, priceUpperBound)
            });
        } else {
            success(response, {
                CSList: await CS.getCSDetails(CSID)
            });
        }
    }
}