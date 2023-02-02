import Authentication from "../../helper/authentication";
import { badRequest, internalServerError, success } from "../../helper/http";
import Route from "../../Route";
import { Request, Response } from "express";
import { checkUndefinedParams } from "../../helper/http";
import { Emsp } from "../../model/Emsp";

export default class LoginRoute extends Route {
    constructor() {
        super("login-emsp", false);
    }

    /**
     * Allows client to login into the system, receiving a JWT in return to keep track of their session
     *
     * @param request shall contain: mspName, apiKey
     * @param response JWT session token
     * @protected
     */
    protected async httpPost(request: Request, response: Response): Promise<void> {
        const mspName = request.body.mspName;
        const apiKey = request.body.apiKey;

        if (checkUndefinedParams(response, mspName, apiKey)) return;

        const emspId = await Emsp.checkCredentials(apiKey);
        if (emspId == null) {
            badRequest(response, "The login information is invalid");
            return;
        }

        if (!Authentication.setAuthenticationCookie(response, mspName, emspId)) {
            internalServerError(response);
            return;
        }

        success(response);
    }
}