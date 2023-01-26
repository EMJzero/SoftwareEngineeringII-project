import Route from "../../Route";
import { Request, Response } from "express";
import { badRequest, checkUndefinedParams, internalServerError, success } from "../../helper/http";
import { hashSync } from "bcrypt";
import env from "../../helper/env";
import logger from "../../helper/logger";
import {IUser, User} from "../../model/User";

export default class RegisterRoute extends Route {
    constructor() {
        super("register", false);
    }
    protected async httpPost(request: Request, response: Response): Promise<void> {
        const username = request.body.username;
        const email = request.body.email;
        const password = request.body.password;
        const creditCardNumber = request.body.creditCardNumber;
        const creditCardCVV = request.body.creditCardCVV;
        const creditCardExpiration = request.body.creditCardExpiration;
        const creditCardBillingName = request.body.creditCardBillingName;

        if (checkUndefinedParams(response, username, email, password, creditCardCVV, creditCardExpiration, creditCardNumber, creditCardBillingName)) return;

        // Check password field length
        // Cannot check this in the model, because we hash the password
        if (password.length < 8 || password.length > 20){
            badRequest(response);
            return;
        }

        const hash = hashSync(password, env.SALT_ROUNDS);

        const newUser: IUser = { id: 0 /*Ignored*/, username, password: hash, email, creditCardBillingName, creditCardNumber, creditCardCVV, creditCardExpiration };
        if (!User.checkUserFields(newUser)) {
            badRequest(response, "One of the parameters has the wrong encoding");
            return;
        }

        if (!(await User.registerNewUser(newUser))) {
            internalServerError(response);
        }

        success(response);
    }
}
