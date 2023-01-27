import Route from "../Route";
import { Request, Response } from "express";
import { badRequest, checkUndefinedParams, internalServerError, success } from "../helper/http";
import { CPMS } from "../model/CPMS";
import { getReqHttp } from "../helper/misc";
import logger from "../helper/logger";
import {Booking} from "../model/Booking";

//TODO: Simple api endpoint to return all bookings. Still need to apply time filters and manage them
export default class Bookings extends Route {

    constructor() {
        super("bookings", true);
    }

    protected async httpGet(request: Request, response: Response): Promise<void> {
        const userID = request.userId;
        const referenceDate = request.query.referenceDate;
        const intervalDays = parseInt(request.query.intervalDays as string);

        if (referenceDate && !intervalDays) {
            badRequest(response, "One of the parameters is missing");
            return;
        }

        success(response, [{
            id: 1,
            name: "Tokyo Tower Hub",
            socketSpeed: "Ultra Fast",
            socketType: "Type A",
            startDate: "2022-20-09T22:12:13",
            endDate: "2022-20-09T23:12:13",
            imageURL: "https://www.japan-guide.com/g18/3003_01.jpg"
        }])
    }
}
