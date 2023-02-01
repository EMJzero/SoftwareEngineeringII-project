import express, { Express } from "express";
import * as WebSocket from "ws";
import * as http from "http";
import { CS } from "./model/CS";
import { getFilesInDir } from "./helper/misc";
import { join } from "path";
import requestLogger from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import Route from "./Route";
import env from "./helper/env";
import logger from "./helper/logger";
import CSConnection, { CSDB } from "./model/CSConnection";

// Expand the Express request definition to include the userId
declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            /**
             * Whether the current request has been validated or not with eMSP Authentication.
             */
            authenticated: boolean;
            mspName: string;
        }
    }
}

/**
 * Represents the CPMS's backend application. Contains useful configuration data and exposes methods to connect
 * to the database and start the application server.
 */
class BackendApp {
    // Domain where this app will be deployed in production
    readonly deploymentURL: string;
    // Port where to start the application server on
    readonly port: number;
    // Port where to start the WebSocket server on
    readonly wsPort: number;
    // Base url where REST endpoints will be registered, relative to the address, default is '/api/'
    readonly baseURL: string;
    // Express application server
    readonly express: Express;
    // WebSocket server
    readonly wsServer: http.Server;

    /**
     * Creates a new BackendApp instance, initializing the configuration data and configuring the app server
     * with all the routes.
     */
    constructor() {
        // Load environment variables defaults
        this.deploymentURL = env.DEPLOYMENT_URL;
        this.port = env.PORT;
        this.wsPort = env.WS_PORT;
        this.baseURL = env.BASE_URL;

        // Create and configure Express app
        this.express = this.createExpressApp();
        
        // Create and prepare the WebSocket server for CSs
        this.wsServer = this.createWebSocketServer();

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
     * Creates a new WebSocket server and configures it.
     * @private
     * @return the newly created websocket server
     */
    protected createWebSocketServer() {
        const server = http.createServer(this.express);

        //initialize the WebSocket server instance
        const wss = new WebSocket.Server({ server });

        wss.on("connection", (ws: WebSocket) => {

            ws.on("message", async (message: string) => {
                const msg = JSON.parse(message);
                //const cs = msg.state;
                //Object.setPrototypeOf(cs, CSConnection.prototype);

                //const sockets: SocketMachine[] = await cs.sockets();
                //sockets.forEach((socket) => Object.setPrototypeOf(socket, SocketMachine.prototype));
                //const socketIDs: number[] = sockets.map((socket: SocketMachine) => socket.socketId);

                if (msg.csId != undefined &&
                    msg.socketsIds != undefined &&
                    await CS.verifyCSandSockets(msg.csId, msg.socketsIds) &&
                    CSDB.shared.getConnectionToCSWithID(msg.csId) == undefined) {
                    // First connection of a CS

                    const connection = new CSConnection(msg.csId, ws);
                    CSDB.shared.registerCS(connection);
                    // Reassign listener to the one in CSConnection
                    ws.removeAllListeners();
                    ws.on("message", (message: string) => CSConnection.webSocketListener(message, connection));
                    // Register listener on delete
                    ws.on("close", () => {
                        CSDB.shared.unregisterCS(connection);
                    });

                    logger.info(`CS connected with id: ${msg.csId}`);

                    const respObject = {
                        status: "ok"
                    };
                    ws.send(JSON.stringify(respObject));
                } else {
                    //Invalid CS

                    const respObject = {
                        status: "error"
                    };
                    ws.send(JSON.stringify(respObject));
                    ws.close();
                }
            });

            //send immediately a feedback to the incoming connection
            const respObject = {
                connected: true
            };
            ws.send(JSON.stringify(respObject));
        });
        
        return server;
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

    /**
     * Starts the WebSocket interface of the express application.
     */
    async startWebsocketServer() {
        await this.wsServer.listen(this.wsPort);
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
    app.startWebsocketServer().then(() => {
        logger.info(`WebSocket server started at: http://127.0.0.1:${app.wsPort}`);
    });
}

// Export app for testing
export default app;
