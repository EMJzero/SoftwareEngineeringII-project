import { badRequest, internalServerError, success } from "../helper/http";
import Route from "../Route";
import { Request, Response } from "express";
import { CS } from "../model/CS";

export default class CSListRoute extends Route {
    constructor() {
        super("CSList", false);
    }

    protected async httpGet(request: Request, response: Response): Promise<void> {
        const CSID = request.body.CSID;
        const location: [number, number] = request.body.location;
        const locationRange: number = request.body.locationRange;
        const priceRange: [number, number] = request.body.priceRange;

        if(CSID == null) {
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