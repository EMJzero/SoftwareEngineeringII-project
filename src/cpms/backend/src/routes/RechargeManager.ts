import { badRequest, checkNaN, checkUndefinedParams, internalServerError, success } from "../helper/http";
import Route from "../Route";
import { Request, Response } from "express";
import { CSDB } from "../model/CSConnection";
import {postReqHttp, StandardResponse} from "../helper/misc";
import logger from "../helper/logger";
import {Emsp} from "../model/Emsp";
import {AxiosError, AxiosResponse} from "axios";

export default class RechargeManager extends Route {
    constructor() {
        super("recharge-manager", true);
    }

    // Provides the status of a CS
    /**
     * Allows the client to retrieve the internal status of a CS, such status contains information regarding any ongoing charging
     * process, socket information and vehicle information.
     *
     * @param request shall contain: CSID, socketID
     * @param response an object containing: CSID, socketID, state, currentPower, maxPower, connectedCar, estimatedTimeRemaining
     * @protected
     */
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
    /**
ì     * Allows the client to start or stop the charging process of a socket of a specific CS.
     *
     * @param request shall contain: stationID, socketID, action (either "start" or "stop")
     * @param response the HTTP status code and message provide information regarding the success or failure of command's
     * application to the CS.
     * @protected
     */
    protected async httpPost(request: Request, response: Response): Promise<void> {
        const CSID = request.body.CSID;
        const socketID = request.body.socketID;
        const action = request.body.action;
        const maximumTimeoutDate = request.body.maximumTimeoutDate;
        const eMSPId = request.mspId;

        if (checkUndefinedParams(response, CSID, socketID, action) || checkNaN(response, maximumTimeoutDate)) return;

        const cookieJWT: string | undefined = request.cookies ? "__session=" + request.cookies?.__session : undefined;
        const axiosResponseRaw = await postReqHttp(request.protocol + "://" + request.get("host") + "/api/cs-manager", {
            stationID: CSID,
            socketID: socketID,
            chargeCommand: action,
            maximumTimeoutDate: maximumTimeoutDate,
            issuerEMSPId: eMSPId
        }, {
            headers: {
                Cookie: cookieJWT,
            },
            withCredentials: true
        });

        if (axiosResponseRaw.isError) {
            const message = ((axiosResponseRaw.res as AxiosError).response?.data as StandardResponse<Object>).message;
            internalServerError(response, message);
            return;
        }

        const axiosResponse = axiosResponseRaw.res as AxiosResponse;

        if(axiosResponse?.status != 200) {
            logger.debug("Axios response status =", axiosResponse?.status);
            internalServerError(response);
            return;
        }

        success(response);
    }
}