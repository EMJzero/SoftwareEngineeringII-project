import {Request, Response} from "express";
import Route from "../Route";
import {checkNaN, checkUndefinedParams, internalServerError, success} from "../helper/http";
import {Account} from "../model/Account";
import logger from "../helper/logger";

export default class AccountsRoute extends Route {

    constructor() {
        super("accounts");
    }

    protected async httpPost(request: Request, response: Response): Promise<void> {
        const cardNumber = request.body.cardNumber;
        const cardOwner = request.body.cardOwner;
        const cvv = request.body.cvv;
        const expiration = request.body.expiration;
        const billable = request.body.billable;
        const command = request.body.command

        console.log(cardNumber, cardOwner, cvv, expiration, billable, command);

        if (checkUndefinedParams(response, cardNumber, cardOwner, expiration, command) || checkNaN(response, cvv)) return;

        if (command == "BILL") {
            if (checkNaN(response, billable)) return;
            try {
                await Account.billAccount({
                    cardNumber,
                    owner: cardOwner,
                    expiration,
                    cvv
                }, billable);
            } catch (e) {
                logger.error("Error while billing account: " + e);
                internalServerError(response, "Cannot complete billing operation");
            }
            success(response);
        } else {
            try {
                const isValid = await Account.checkAccount({
                    cardNumber,
                    owner: cardOwner,
                    expiration,
                    cvv
                });
                success(response, {
                    valid: isValid
                });
            } catch (e) {
                logger.error("Error while querying account: " + e);
                internalServerError(response, "Cannot complete operation");
            }
        }
    }

}