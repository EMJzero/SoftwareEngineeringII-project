import {CPMS, ICPMS} from "../model/CPMS";
import {postReqHttp} from "./misc";
import logger from "./logger";

const jwtDecode = require('jwt-decode');

export default class CPMSAuthentication {

    public static async getTokenIfNeeded(cpms: ICPMS): Promise<ICPMS> {
        const tokenValue = cpms.token?.replace("__session=", "");
        if (!cpms.token || (tokenValue && this.isJwtExpired(this.extractJWTFromCookie(tokenValue)))) { //This should handle token refreshes AND missing tokens
            //Authenticate with the CPMS
            try {
                const axiosResponse = await postReqHttp(cpms.endpoint + "/login-emsp", null, {mspName: "eMall", apiKey: cpms.apiKey});
                if (axiosResponse) {
                    const headers = axiosResponse.headers;
                    const cookie = headers["set-cookie"];
                    if (cookie) {
                        cpms.token = cookie?.find((cookieStr) => cookieStr.includes("__session")) ?? null;
                        await CPMS.updateToken(cpms.id, cpms.token)
                    }
                }
            } catch (error) {
                logger.error(error);
            }
        }
        return cpms;
    }

    private static extractJWTFromCookie(cookie: string): string {
        const cookieVal = cookie.replace("__session=", "");
        const firstSemicolonIdx = cookieVal.indexOf(";");
        return cookieVal.slice(0, firstSemicolonIdx);
    }

    private static isJwtExpired(token: string) {
        let isJwtExpired = false;
        const { exp } = jwtDecode(token);
        const currentTime = new Date().getTime() / 1000;
        if (currentTime > exp) isJwtExpired = true;

        return isJwtExpired;
    }

}