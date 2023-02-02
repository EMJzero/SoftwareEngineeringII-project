import Route from "../Route";
import { Request, Response } from "express";
import {badRequest, checkNaN, checkUndefinedParams, internalServerError, success} from "../helper/http";
import { CSDB } from "../model/CSConnection";
import { CSChargeCommand } from "../model/CSChargeCommand";
import {Emsp} from "../model/Emsp";
import logger from "../helper/logger";

export default class CSManagerRoute extends Route {

    constructor() {
        super("cs-manager", true);
    }

    /**
     * FOR INTERNAL USAGE ONLY
     * Allows the caller to retrieve the state of a CS's sockets, based such CS's id provided in the querystring.
     *
     * @param request shall containt: stationID
     * @param response socketStates as array of {@link SocketMachine}
     * @protected
     */
    protected async httpGet(request: Request, response: Response): Promise<void> {
        //Queries the status of a CS (i.e. its sockets)
        const csID = request.query.stationID as string;

        if (checkUndefinedParams(response, csID)) return;

        const csConnection = CSDB.shared.getConnectionToCSWithID(parseInt(csID));
        if (!csConnection) {
            badRequest(response, "No charging station was found with an active connection with the provided ID");
            return;
        }

        const sockets = await csConnection.sockets();
        success(response, {
            socketStates: sockets
        });
    }

    /**
     * FOR INTERNAL USAGE ONLY
     * Allows the caller to start or stop the charging process of a socket of a specific CS.
     *
     * @param request shall contain: stationID, socketID, chargeCommand (either "start" or "stop")
     * @param response the HTTP status code and message provide information regarding the success or failure of command's
     * application to the CS.
     * @protected
     */
    protected async httpPost(request: Request, response: Response): Promise<void> {
        //Starts/Stops a charge at a socket
        const csID = request.body.stationID as number;
        const socketID = request.body.socketID as number;
        const chargeCommand = request.body.chargeCommand as CSChargeCommand;
        const issuerEMSPId = request.body.issuerEMSPId;
        const maximumTimeoutDate = request.body.maximumTimeoutDate;

        if (checkUndefinedParams(response, csID, socketID, chargeCommand) || checkNaN(response, maximumTimeoutDate, issuerEMSPId)) return;

        const csConnection = CSDB.shared.getConnectionToCSWithID(csID);
        if (!csConnection) {
            badRequest(response, "No charging station was found with an active connection with the provided ID");
            return;
        }

        const issuerEMSP = Emsp.findById(issuerEMSPId);
        if (!issuerEMSP) {
            badRequest(response, "No issuer eMSP was found!");
            return;
        }

        let result = false;
        try {
            if (chargeCommand == CSChargeCommand.startCharge) {
                result = await csConnection.startCharge(socketID, maximumTimeoutDate, issuerEMSPId);
            } else if (chargeCommand == "stop") {
                result = await csConnection.stopCharge(socketID);
            } else {
                badRequest(response, "Unrecognized command");
                return;
            }
        } catch (error) {
            logger.error("Could not execute charge command on the station. Reason: " + error);
            internalServerError(response, "Could not execute charge command on the station. Reason: " + error);
            return;
        }

        if (!result) {
            console.log("UNSUCCESSFUL");
            internalServerError(response, "Operation returned unsuccessful");
            return;
        }
        success(response);
    }

}