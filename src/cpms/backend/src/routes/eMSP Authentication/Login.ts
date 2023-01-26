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

    protected async httpPost(request: Request, response: Response): Promise<void> {
        const mspName = request.body.mspName;
        const apiKey = request.body.apiKey;

        if (checkUndefinedParams(response, mspName, apiKey)) return;

        if (!await Emsp.checkCredentials(apiKey)) {
            badRequest(response, "The login information is invalid");
            return;
        }

        if (!Authentication.setAuthenticationCookie(response, mspName)) {
            internalServerError(response);
            return;
        }

        success(response);
    }
}