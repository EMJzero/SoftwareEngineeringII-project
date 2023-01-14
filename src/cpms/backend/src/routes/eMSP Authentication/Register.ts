import Route from "../../Route";
import { Request, Response } from "express";
import { badRequest, checkUndefinedParams, internalServerError, success } from "../../helper/http";
import { hashSync } from "bcrypt";
import { randomBytes } from "crypto";
import env from "../../helper/env";
import logger from "../../helper/logger";
/*import { handleInsert } from "../../helper/misc";

//TODO: Remove before release!!!!
export default class RegisterRoute extends Route {

    constructor() {
        super("register", false, false);
    }

    protected async httpPost(request: Request, response: Response): Promise<void> {


        const hash = hashSync(password, env.SALT_ROUNDS);
        const activationToken = randomBytes(64).toString("hex");

        const newUser = { username, password: hash, email, activationToken };
        //TODO: Insert user in database!

        success(response);
    }
}*/
