import { compareSync } from "bcrypt";
import Authentication from "../../helper/authentication";
import { badRequest, internalServerError, success } from "../../helper/http";
import Route from "../../Route";
import { Request, Response } from "express";
import { checkUndefinedParams } from "../../helper/http";
import { User } from "../../model/User";

export default class LoginRoute extends Route {
    constructor() {
        super("login", false);
    }

    protected async httpPost(request: Request, response: Response): Promise<void> {
        const username = request.body.username;
        const password = request.body.password;

        if (checkUndefinedParams(response, username, password)) return;

        const user = await User.findByUsername(username);
        if (!user) {
            badRequest(response, "The username or password is invalid");
            return;
        }

        const passwordValid = compareSync(password, user.password);
        if (!passwordValid) {
            badRequest(response, "The username or password is invalid");
            return;
        }

        if (!Authentication.setAuthenticationCookie(response, user)) {
            internalServerError(response);
            return;
        }

        success(response, { "username": username, "email": user.email });
    }
}