import { DBAccess } from "../DBAccess";
import { FieldPacket, RowDataPacket } from "mysql2/promise";

export class Emsp {
    id: number;
    APIKey: string;

    constructor(id: number, APIKey: string) {
        this.id = id;
        this.APIKey = APIKey;
    }

    public static async checkCredentials(APIKey: string): Promise<boolean> {
        const connection = await DBAccess.getConnection();

        const [result, _]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
            "SELECT id FROM emsps WHERE APIKey = ?",
            [APIKey]);

        connection.release();

        return result.length != 0;
    }
}