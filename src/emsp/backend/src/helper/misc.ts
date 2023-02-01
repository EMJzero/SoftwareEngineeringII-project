import { readdirSync, statSync } from "fs";
import axios, { AxiosResponse } from "axios";
import logger from "./logger";


/**
 * Gets all files recursively from a directory.
 * @param dirPath the path of the directory
 * @param arrayOfFiles the array of already found files, as this is a recursive function
 * @return an array containing the name of all the files present in the directory and in all subdirectories
 */
export function getFilesInDir(dirPath: string, arrayOfFiles: string[] = []) {
    const files = readdirSync(dirPath);

    files.forEach(function (file) {
        if (statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getFilesInDir(dirPath + "/" + file, arrayOfFiles);
        } else {
            arrayOfFiles.push(dirPath + "/" + file);
        }
    });

    return arrayOfFiles;
}

/**
 * Checks if an url is valid or not through a regex.
 * @param url The URL to validate
 */
export function checkURL(url: string): boolean {
    return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u00a1-\uffff][a-z0-9\u00a1-\uffff_-]{0,62})?[a-z0-9\u00a1-\uffff]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(url);
}

/**
 * Make a get http request to a specific url
 * @param url the url of the request
 * @param token use this if you want to put an auth token
 * @param parameters
 */
export async function getReqHttp(url: string, token: string | null, parameters: object): Promise<AxiosResponse | null> {
    const config = token ? {
        headers: { "Authorization": `Bearer ${token}` },
        params: parameters
    } : { params: parameters };
    let res;
    try {
        res = await axios.get(url, config);
        return res;
    } catch (e) {
        logger.error(e);
        logger.error("Axios response status:", res != undefined ? res.status : "undefined");
        return null;
    }
}

/**
 * Make a post http request to a specific url
 * @param url the url of the request
 * @param token use this if you want to put an auth token
 * @param body the object containing the field and the value of the query string
 */
export async function postReqHttp(url: string, token: string | null, body: object): Promise<AxiosResponse | null> {
    const config = token ? { headers: { "Authorization": `Bearer ${token}` } } : undefined;
    let res;
    try {
        res = await axios.post(url, body, config);
        return res;
    } catch (e) {
        logger.error("Axios response status:", res != undefined ? res.status : "undefined");
        return null;
    }
}

/**
 * Make a delete http request to a specific url
 * @param url the url of the request
 * @param token use this if you want to put an auth token
 * @param query the object containing the field and the value of the query string
 */
export async function deleteReqHttp(url: string, token: string, query: object): Promise<AxiosResponse | null> {
    let res;
    try {
        const config = { headers: { "Authorization": `Bearer ${token}` }, params: query };
        // TODO: manage body
        res = await axios.delete(url, config);
        return res;
    } catch (e) {
        logger.error("Axios response status:", res != undefined ? res.status : "undefined");
        return null;
    }
}