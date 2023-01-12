import Route from "../../Route";
import { Request, Response } from "express";
import { badRequest, checkUndefinedParams, internalServerError, success } from "../../helper/http";
import { hashSync } from "bcrypt";
import { randomBytes } from "crypto";
import env from "../../helper/env";
import logger from "../../helper/logger";
import { handleInsert } from "../../helper/misc";

export default class RegisterRoute extends Route {
    constructor() {
        super("register", false, false);
    }
    protected async httpPost(request: Request, response: Response): Promise<void> {
        const username = request.body.username;
        const email = request.body.email;
        const password = request.body.password;

        if (checkUndefinedParams(response, username, email, password)) return;

        // Check password field length
        // Cannot check this in the model, because we hash the password
        if (password.length < 8 || password.length > 20){
            badRequest(response);
            return;
        }

        const hash = hashSync(password, env.SALT_ROUNDS);
        const activationToken = randomBytes(64).toString("hex");

        const newUser = { username, password: hash, email, activationToken };
        //TODO: Insert user in database!

        success(response);
    }
}
