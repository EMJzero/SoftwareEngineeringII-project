import { badRequest, checkNaN, checkUndefinedParams, internalServerError, success } from "../helper/http";
import Route from "../Route";
import { Request, Response } from "express";
import { CSDB } from "../model/CSConnection";
import { postReqHttp } from "../helper/misc";
import logger from "../helper/logger";

export default class RechargeManager extends Route {
    constructor() {
        super("recharge-manager", false);
    }

    // Provides the status of a CS
    protected async httpGet(request: Request, response: Response): Promise<void> {
        const CSID: number = parseInt(request.query.CSID as string);
        const socketID: number = parseInt(request.query.socketID as string);

        if (checkNaN(response, CSID, socketID)) return;

        const connection = CSDB.shared.getConnectionToCSWithID(CSID);
        if (!connection) {
            badRequest(response, "Invalid CSID");
            return;
        }

        const socket = await connection.getSocket(socketID);
        if (!socket) {
            badRequest(response, "Invalid socketID");
            return;
        }

        try {
            const respObject = {
                CSID,
                socketID,
                state: socket.state,
                currentPower: socket.currentPower,
                maxPower: socket.maxPower,
                connectedCar: socket.connectedCar,
                estimatedTimeRemaining: socket.getEstimatedTimeRemaining()
            };
            success(response, respObject);
        } catch (error) {
            internalServerError(response, "" + error);
            return;
        }
    }

    // Start/Stop charging process
    protected async httpPost(request: Request, response: Response): Promise<void> {
        const CSID = request.body.CSID;
        const socketID = request.body.socketID;
        const action = request.body.action;

        if (checkUndefinedParams(response, CSID, socketID, action)) return;

        let axiosResponse;
        try {
            axiosResponse = await postReqHttp(request.protocol + "://" + request.get("host") + "/cs-manager", {
                stationID: CSID,
                socketID: socketID,
                chargeCommand: action
            });
        } catch (e) {
            logger.debug("Axios response status =", axiosResponse?.status);
            internalServerError(response, "" + e);
            return;
        }

        success(response);
    }
}