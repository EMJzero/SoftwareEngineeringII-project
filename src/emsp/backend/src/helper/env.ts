import { config } from "dotenv";

// Read environment variables from a .env file if we are not in a testing environment
if (process.env.NODE_ENV != "testing")
    config();

/**
 * Interface containing all the possible environment variables needed by PrivTAP Backend.
 */
interface EnvVariables {
    // Port where the app server will run
    PORT: number,
    // Relative URL where all routes will start from, this MUST be a relative URL
    BASE_URL: string,
    // Flag representing if we are in a production environment
    PROD: boolean,
    // Flag representing if we are in a development environment
    DEV: boolean,
    // Rounds of salting that will be applied to password hashes before storing them in the database
    SALT_ROUNDS: number,
    // Secret key used to sign the JWT tokens
    JWT_SECRET: string,
    // Expiration time (in seconds) of the JWT tokens
    JWT_EXPIRE: number,
    // Absolute URL where the app server will be deployed in production
    DEPLOYMENT_URL: string,
    // Absolute URL of the frontend, needed to configure CORS policy in development environment
    FRONTEND_URL: string,
    // The minimum level of messages to log
    LOG_LEVEL: "log"|"trace"|"debug"|"info"|"warn"|"error"|"fatal",
    // The database connection strings for our database
    DB_HOST: string,
    DB_USER: string,
    DB_PASSWORD: string,
    DB_DATABASE: string,
    // Size of the minimum timeslot that can be booked
    TIME_SLOT_SIZE: number
}

// Default values for some of the env variables
const defaults = {
    PORT: 8000,
    BASE_URL: "/api/",
    SALT_ROUNDS: 1,
    JWT_SECRET: "this_is_an_insecure_secret",
    JWT_EXPIRE: 86400,
    DEPLOYMENT_URL: "https://privtap.it",
    FRONTEND_URL: "http://127.0.0.1:5173",
    LOG_LEVEL: "info",
    DB_HOST: "localhost",
    DB_USER: "root",
    DB_PASSWORD: "Doberman180",
    DB_DATABASE: "cpms_db",
    TIME_SLOT_SIZE: 60
};

/**
 * Load the environment variables into a EnvVariables object.
 * @throws Error if variables are invalid or if a variable without a default is not set
 */
function loadEnvVariables(): EnvVariables {
    const res: {[name: string]: string|number|boolean} = {};

    // Check if the defaults should be overwritten
    for (const [name, value] of Object.entries(defaults)) {
        const envVariable = process.env[name];
        if (envVariable) {
            let newEnvVariable: string|number = envVariable;

            // If the default value for this variable is a number, try to convert the new value to a number
            if (typeof value == "number") {
                newEnvVariable = Number.parseInt(envVariable);
                if (Number.isNaN(newEnvVariable))
                    throw Error(`Environment variable ${name} is not a valid number`);
            }

            res[name] = newEnvVariable;
        }
        else
            res[name] = value;
    }

    // Check if we are in a production environment
    res.PROD = process.env.NODE_ENV == "production";

    // Check if we are in a development environment
    res.DEV = process.env.NODE_ENV == "development";

    // Check if the DB connection string is set, if not throw an error
    res.DB_HOST = process.env.DB_HOST || "";
    if (res.DB_HOST == "")
        throw Error("Database connection string environment variable is not set");

    // Force the cast of res to EnvVariables before returning it
    // as we know that it will not contain any different properties
    res.CLIENT_ID = process.env.CLIENT_ID || "";
    res.CLIENT_SECRET = process.env.CLIENT_SECRET || "";
    return res as unknown as EnvVariables;
}

// Save the environment variables to an object and export it
const env: EnvVariables = loadEnvVariables();
export default env;