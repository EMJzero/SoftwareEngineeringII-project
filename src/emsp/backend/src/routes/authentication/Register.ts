import Route from "../../Route";
import { Request, Response } from "express";
import { badRequest, checkUndefinedParams, internalServerError, success } from "../../helper/http";
import { hashSync } from "bcrypt";
import env from "../../helper/env";
import logger from "../../helper/logger";
import { IUser, User } from "../../model/User";
import {postReqHttp, StandardResponse} from "../../helper/misc";
import {AxiosError, AxiosResponse} from "axios";

export default class RegisterRoute extends Route {
    constructor() {
        super("register", false);
    }

    /**
     * Allows a new client to register with the system, having its credentials added in the DB.
     *
     * @param request must contain: username, email, password, creditCardNumber, creditCardCVV, creditCardExpiration, creditCardBillingName
     * @param response result of the registration (given by the HTTP status code)
     * @protected
     */
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

        const bankResponseRaw = await postReqHttp(env.PAYMENT_PROVIDER_URL, null, {
            cardNumber: newUser.creditCardNumber,
            cardOwner: newUser.creditCardBillingName,
            cvv: newUser.creditCardCVV,
            expiration: newUser.creditCardExpiration,
            billable: 0,
            command: "CHK"
        });

        if (bankResponseRaw.isError) {
            const message = ((bankResponseRaw.res as AxiosError).response?.data as StandardResponse<Object>).message;
            badRequest(response, message);
            return;
        }

        const isValid = (bankResponseRaw.res as AxiosResponse).data.data.valid;

        if (!isValid) {
            badRequest(response, "Invalid credit card data");
            return;
        }

        try {
            if (!(await User.registerNewUser(newUser))) {
                internalServerError(response);
            }

            success(response);
        } catch (error) {
            logger.error(error);
            badRequest(response, "Could not register the new user");
        }
    }
}
