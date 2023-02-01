import { badRequest, checkNaN, internalServerError, success } from "../helper/http";
import Route from "../Route";
import { Request, Response } from "express";
import { CS } from "../model/CS";
import logger from "../helper/logger";

export default class CSListRoute extends Route {
    constructor() {
        super("cs-list", true);
    }

    /**
     * Allows clients to fetch a list of CS based on a variety of filters, such as position or price.
     *
     * @param request can contain: locationLatitude, locationLongitude, locationRange, priceLowerBound, priceUpperBound
     * @param response CSList as array of {@link CS}
     * @protected
     */
    protected async httpGet(request: Request, response: Response): Promise<void> {
        const CSID: number = parseInt(request.query.CSID as string);

        try {
            if (!CSID) {
                const locationLatitude: number = parseFloat(request.query.locationLatitude as string);
                const locationLongitude: number = parseFloat(request.query.locationLongitude as string);
                const locationRange: number = parseFloat(request.query.locationRange as string);
                const priceLowerBound: number = parseFloat(request.query.priceLowerBound as string);
                const priceUpperBound: number = parseFloat(request.query.priceUpperBound as string);

                if (checkNaN(response, locationLatitude, locationLongitude, locationRange, priceLowerBound, priceUpperBound)) return;

                let error = "";
                if (locationLatitude < -90 || locationLatitude > 90)
                    error += "\nInvalid latitude";
                if (locationLongitude < -180 || locationLongitude > 180)
                    error += "\nInvalid longitude";
                if (locationRange < 0)
                    error += "\nInvalid location range";
                if (priceLowerBound < 0 || priceUpperBound < priceLowerBound)
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
        } catch (e) {
            logger.debug("DB access for CSs failed");
            internalServerError(response);
            return;
        }
    }
}