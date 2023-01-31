import { DBAccess } from "../DBAccess";
import { FieldPacket, RowDataPacket } from "mysql2/promise";

export class Emsp {
    id: number;
    APIKey: string;

    constructor(id: number, APIKey: string) {
        this.id = id;
        this.APIKey = APIKey;
    }

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

    public static async getNotificationEndpoint(eMSPId: number): Promise<string> {
        const connection = await DBAccess.getConnection();

        const [result]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
            "SELECT NotificationEndpoint AS nep FROM emsps WHERE id = ?",
            [eMSPId]);

        connection.release();

        return result[0].nep;
    }
}