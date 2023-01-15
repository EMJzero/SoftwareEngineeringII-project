import { badRequest, success } from "../helper/http";
import Route from "../Route";
import { Request, Response } from "express";
import { CS } from "../model/CS";

export default class CSListRoute extends Route {
    constructor() {
        super("CSList", false);
    }

    protected async httpGet(request: Request, response: Response): Promise<void> {
        const CSID = request.body.CSID;
        //latitude, longitude
        const location: [number, number] = request.body.location;
        const locationRange: number = request.body.locationRange;
        const priceRange: [number, number] = request.body.priceRange;

        if(CSID == null) {
            let error  = "";
            if(location[0] < -90 || location[0] > 90)
                error += "\nInvalid latitude";
            if(location[1] < -180 || location[0] > 180)
                error += "\nInvalid longitude";
            if(locationRange < 0)
                error += "\nInvalid location range";
            if(priceRange[0] < 0 || priceRange[1] < priceRange[0])
                error += "\nInvalid price range";
            if(error != "") {
                badRequest(response, "Errors:" + error);
                return;
            }
            success(response, {
                "CSList": await CS.getCSList(location, locationRange, priceRange)
            });
        } else {
            success(response, {
                "CSList": await CS.getCSDetails(CSID)
            });
        }
    }
}