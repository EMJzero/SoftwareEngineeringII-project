import { badRequest, checkUndefinedParams, success } from "../helper/http";
import Route from "../Route";
import { Request, Response } from "express";
import { CS } from "../model/CS";

export default class CSListRoute extends Route {
    constructor() {
        super("CSList", false);
    }

    protected async httpGet(request: Request, response: Response): Promise<void> {
        const CSID = request.body.CSID;

        const locationLatitude: number = request.body.locationLatitude;
        const locationLongitude: number = request.body.locationLongitude;
        const locationRange: number = request.body.locationRange;
        const priceLowerBound: number = request.body.priceLowerBound;
        const priceUpperBound: number = request.body.priceUpperBound;

        console.log("Test to check the type of the parameters: " + typeof request.body.locationLatitude);

        if(checkUndefinedParams(response, locationLatitude, locationLongitude, locationRange, priceLowerBound, priceUpperBound))
            return;

        if(CSID == null) {
            let error  = "";
            if(locationLatitude < -90 || locationLatitude > 90)
                error += "\nInvalid latitude";
            if(locationLongitude < -180 || locationLongitude > 180)
                error += "\nInvalid longitude";
            if(locationRange < 0)
                error += "\nInvalid location range";
            if(priceLowerBound < 0 || priceUpperBound < priceUpperBound)
                error += "\nInvalid price range";
            if(error != "") {
                badRequest(response, "Errors:" + error);
                return;
            }
            success(response, {
                "CSList": await CS.getCSList(locationLatitude, locationLongitude, locationRange, priceLowerBound, priceUpperBound)
            });
        } else {
            success(response, {
                "CSList": await CS.getCSDetails(CSID)
            });
        }
    }
}