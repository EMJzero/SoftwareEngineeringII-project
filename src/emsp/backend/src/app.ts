import express, { Express } from "express";
import { getFilesInDir } from "./helper/misc";
import { join } from "path";
import requestLogger from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import Route from "./Route";
import env from "./helper/env";
import logger from "./helper/logger";

// Expand the Express request definition to include the userId
declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            /**
             * The id of the user that sent this request.
             * Optionally set by eMSP Authentication middleware if JWT cookie is provided and valid. Can be used by other middleware.
             */
            userId: number;
            /**
             * The username of the registered and logged-in user.
             */
            username: string;
        }
    }
}

/**
 * Represents the backend application. Contains useful configuration data and exposes methods to connect
 * to the database and start the application server.
 */
class BackendApp {
    // Domain where this app will be deployed in production
    readonly deploymentURL: string;
    // Port where to start the application server on
    readonly port: number;
    // Base url where REST endpoints will be registered, relative to the address, default is '/api/'
    readonly baseURL: string;
    // Express application server
    readonly express: Express;

    /**
     * Creates a new BackendApp instance, initializing the configuration data and configuring the app server
     * with all the routes.
     */
    constructor() {
        // Load environment variables defaults
        this.deploymentURL = env.DEPLOYMENT_URL;
        this.port = env.PORT;
        this.baseURL = env.BASE_URL;

        // Create and configure Express app
        this.express = this.createExpressApp();

        // Register routes defined in /routes
        this.registerAllRoutes();
    }

    /**
     * Creates a new Express application server and configures all the needed extensions.
     * @private
     * @return the newly created application server
     */
    protected createExpressApp() {
        const app = express();

        // We need to configure our app for CORS requests.
        // The environment variable FRONTEND_URL should be the URL of the frontend that is making the requests

        logger.info(env.FRONTEND_URL);

        // Configure CORS for preflight requests
        app.options(
            "*",
            cors({
                origin: env.FRONTEND_URL,
                credentials: true,
                allowedHeaders: ["Cookie", "Content-Type"],
            })
        );

        // Configure CORS for all endpoints
        app.use(
            cors({
                origin: env.FRONTEND_URL,
                credentials: true,
            })
        );

        app.use(express.json());
        app.use(express.urlencoded({ extended: false }));
        app.use(cookieParser());

        // If we are in a development environment
        if (env.DEV) {
            // Log all requests to console
            app.use(requestLogger("dev"));
        }

        return app;
    }

    /**
     * Registers a new route from a TypeScript file. The file should export as default a class declaration
     * that extends Route.
     * @param filePath the path from where to import the route class
     * @protected
     */
    protected async registerRoute(filePath: string) {
        const routeClass = (await import(filePath)).default as typeof Route;
        const routeInstance = new routeClass();
        this.express.use(
            this.baseURL + routeInstance.endpointName,
            routeInstance.router
        );
    }

    /**
     * Registers all the routes defines in the 'routes/' directory to the Express app server.
     * @private
     */
    protected registerAllRoutes() {
        const routeFiles = getFilesInDir(join(__dirname, "routes")).map(
            (filePath) => filePath.slice(0, -3)
        ); // Remove file extension
        for (const filePath of routeFiles) {
            this.registerRoute(filePath).then();
        }
    }

    /**
     * Starts the Express application server on the configured port.
     */
    async startApp() {
        await this.express.listen(this.port);
    }
}

// Create a new instance of our backend application
const app = new BackendApp();

// If this is being run as a script, connect to the db and start the application server.
// Otherwise, this is being imported for testing and the testing library will take care of the setup
if (require.main === module) {
    // TODO: Connect to the database
    // Once connected to the database, start the application server
    app.startApp().then(() => {
        // Print to console the URL of the application server
        let url = `http://127.0.0.1:${app.port}`;
        if (env.PROD) {
            url = app.deploymentURL;
        }

        logger.info(`Server listening at: ${url}${app.baseURL}`);
    });
}

// Export app for testing
export default app;
