import { badRequest, checkUndefinedParams, success } from "../helper/http";
import Route from "../Route";
import { Request, Response } from "express";
import { CSDB } from "../model/CSConnection";

export default class RechargeManager extends Route {
    constructor() {
        super("CSList", false);
    }

    protected async httpGet(request: Request, response: Response): Promise<void> {
        const CSID: number = parseInt(request.query.CSID as string);
        const socketID: number = parseInt(request.query.socketID as string);

        if(checkUndefinedParams(response, CSID, socketID))
            return;

        const connection = CSDB.shared.getConnectionToCSWithID(CSID);
        if(connection == undefined) {
            badRequest(response, "Invalid CSID");
            return;
        }
        const socket = connection.getSocket(socketID);
        if(socket == undefined) {
            badRequest(response, "Invalid socketID");
            return;
        }

        success(response, {
            CSID: CSID,
            socketID: socketID,
            state: socket.state,
            currentPower: socket.currentPower,
            maxPower: socket.maxPower,
            connectedCar: socket.connectCar(),
            estimatedTimeRemaining: socket.getEstimatedTimeRemaining()
        });
    }

    protected async httpPost(request: Request, response: Response): Promise<void> {
        const CSID = request.body.CSID;
        const socketID = request.body.socketID;
        const action = request.body.action;

        if(checkUndefinedParams(response, CSID, socketID, action))
            return;

        const connection = CSDB.shared.getConnectionToCSWithID(CSID);
        if(connection == undefined) {
            badRequest(response, "Invalid CSID");
            return;
        }

        if(action == "start") {
            if(!connection.startCharge(socketID)) {
                badRequest(response, "Invalid socketID");
            }
        } else if(action == "end") {
            if(!connection.stopCharge(socketID)) {
                badRequest(response, "Invalid socketID");
            }
        } else
            badRequest(response, "Invalid action, allowed ones: {start, end}");
    }
}