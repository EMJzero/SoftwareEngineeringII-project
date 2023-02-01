import Route from "../../Route";
import { Request, Response } from "express";
import { success } from "../../helper/http";

export default class LogoutRoute extends Route {
    constructor() {
        super("logout", true);
    }

    /**
     * Allows client to remove their JTW token, hence logging out of the system.
     *
     * @param request just an empty http get
     * @param response success response and clear cookie directive
     * @protected
     */
    protected async httpGet(request: Request, response: Response): Promise<void> {
        response.clearCookie("__session");
        success(response, {}, "Logged out");
    }
}
