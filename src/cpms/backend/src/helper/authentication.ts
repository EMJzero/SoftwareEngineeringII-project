import { CookieOptions, NextFunction, Request, Response } from "express";
import { verify, sign, JwtPayload } from "jsonwebtoken";
import * as crypto from "crypto";
import {
    internalServerError,
    unauthorizedUserError
} from "./http";
import env from "./env";
import logger from "./logger";

export class AuthError extends Error {
    constructor(message?: string) {
        super(message);
    }
}

export default abstract class Authentication {
    static readonly API_KEY_HEADER = "cpms-api-key";

    /**
     * Middleware function used to check for a valid JWT eMSP Authentication token in the cookies of a request.
     * Automatically sends back unauthorized response if the token is not valid.
     * @param request the HTTP request
     * @param response the HTTP response
     * @param next function to call if the request eMSP Authentication is valid
     */
    static checkAuthentication(request: Request, response: Response, next: NextFunction) {
        let decodedJWT;
        try {
            decodedJWT = Authentication.checkJWT(request);
        } catch (e) {
            if (e instanceof AuthError) {
                logger.debug("Auth check failed, JWT is not valid: ", e.message);
                unauthorizedUserError(response);
            } else {
                logger.warn("Auth check failed, something bad happened\n", e);
                internalServerError(response);
            }
            return;
        }

        request.authenticated = true;
        request.mspName = decodedJWT.mspName;
        request.mspId = decodedJWT.mspId;

        next();
    }

    /**
     * Checks in the cookies of the request if a JWT token is present. If so, tries to decode it
     * @param request the HTTP request
     * @throws AuthError if the cookie does not exist or if it is not possible to decode it
     * @throws Error if the JWT_SECRET env variable is not defined
     * @return Returns the userId and the activation status
     */
    static checkJWT(request: Request): { mspName: string, mspId: number } {
        const secret = env.JWT_SECRET;

        const cookieJWT: string | undefined = request.cookies?.__session;
        console.log(cookieJWT);
        if (!cookieJWT) {
            logger.debug("__session cookie is undefined, headers are: ", request.headers);
            throw new AuthError("JWT Cookie is undefined");
        }

        let decoded;
        try {
            decoded = verify(cookieJWT, secret) as JwtPayload;
        } catch (e) {
            let errMessage = "JWT Cookie can't be verified";

            if (e instanceof Error) {
                errMessage += ": " + e.message;
            }

            throw new AuthError(errMessage);
        }

        if (!decoded) {
            throw new AuthError("JWT Cookie can't be decoded");
        }

        const payload = decoded["payload"];
        const mspName = decoded["username"];
        const mspId = decoded["id"];
        if (!payload || typeof payload != "string" || !mspName || typeof mspName != "string" || !mspId || typeof mspId != "number") {
            throw new AuthError("JWT Cookie is invalid");
        }

        return { mspName: mspName, mspId: mspId };
    }

    /**
     Create a json web token encrypted using the secret in the env
     @param mspName: the eMSP of which you want to create the token
     * @param mspId: the id of the eMSP that is being logged in
     */
    static createJWT(mspName: string, mspId: number): string | undefined {
        const secret = env.JWT_SECRET;
        if (secret) {
            return sign({ "payload": crypto.randomUUID(), "username": mspName, "id": mspId }, secret, {
                expiresIn: env.JWT_EXPIRE
            });
        }
    }

    /**
     * Sets the appropriate headers in the response to send back the eMSP Authentication cookie to the client.
     * @param response the response that will set the cookie
     * @param mspName Th eMSP name of the registered MSP
     * @param mspId the id of the eMSP that is being logged in
     * @protected
     */
    static setAuthenticationCookie(response: Response, mspName: string, mspId: number) {
        // Create a JWT token for the user
        const jwt = Authentication.createJWT(mspName, mspId);
        if (!jwt)
            return false;

        // Calculate the expiration time for the cookie.
        // We set it the same as the expiration time of the JWT token, but we need to convert
        // it to milliseconds, as JWT expiration time is in seconds
        let cookieExpires = env.JWT_EXPIRE;
        cookieExpires *= 1000;

        // Set default cookie options:
        // - expires at the same time as the JWT does, so that the browser can recognize it and delete it
        // - HTTPOnly to ensure that it is not vulnerable to XSS
        // - Secure to ensure that it won't be passed through unsecure http connections (localhost is an exception)
        // - SameSite=strict to ensure that it won't be passed to external websites
        const cookieOptions: CookieOptions = {
            expires: new Date(Date.now() + cookieExpires),
            httpOnly: true,
            secure: true,
            // If we are in a development environment we set SameSite=none to ensure that the cookie will be
            // set on the frontend even if it is running on a different port
            sameSite: env.PROD ? "lax" : "none"
        };

        // Set the cookie header
        response.cookie("__session", jwt, cookieOptions);
        return true;
    }

}
