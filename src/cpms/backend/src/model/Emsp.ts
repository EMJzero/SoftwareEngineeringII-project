import { DBAccess } from "../DBAccess";
import { FieldPacket, RowDataPacket } from "mysql2/promise";

/**
 * Model class for an EMSP which is known by the CPMS and is allowed to login with its system.
 * From this class queries are performed on the DB to retrieve the necessary tuples, then
 * returned as instances of this class.
 *
 * @class
 */
export class Emsp {
    id: number;
    APIKey: string;
    notificationEndpoint: string

    constructor(id: number, APIKey: string, notificationEndpoint: string) {
        this.id = id;
        this.APIKey = APIKey;
        this.notificationEndpoint = notificationEndpoint;
    }

    /**
     * Retrieves the EMSP with the given ID.
     * @param id
     */
    public static async findById(id: number): Promise<Emsp | null> {
        const connection = await DBAccess.getConnection();

        const [result]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
            "SELECT * FROM emsps WHERE id = ?",
            [id]);

        connection.release();

        if(result.length == 0)
            return null;

        return new Emsp(result[0].id, result[0].APIKey, result[0].NotificationEndpoint);
    }

    /**
     * Retrieves the id of the EMPS whose credentials have been provided, null if the credentials are invalid.
     * @param APIKey
     */
    public static async checkCredentials(APIKey: string): Promise<number | null> {
        const connection = await DBAccess.getConnection();

        const [result]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
            "SELECT id FROM emsps WHERE APIKey = ?",
            [APIKey]);

        connection.release();

        if(result.length == 0)
            return null;

        return result[0].id;
    }

    /**
     * Recovers the URL of the notification endpoint of a known EMPS.
     * @param eMSPId
     */
    /*public static async getNotificationEndpoint(eMSPId: number): Promise<string> {
        const connection = await DBAccess.getConnection();

        const [result]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
            "SELECT NotificationEndpoint AS nep FROM emsps WHERE id = ?",
            [eMSPId]);

        connection.release();

        return result[0].nep;
    }*/
}