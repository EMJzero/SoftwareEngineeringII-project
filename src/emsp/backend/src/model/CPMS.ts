import { DBAccess } from "../DBAccess";
import { FieldPacket, RowDataPacket } from "mysql2/promise";

export interface ICPMS {
    id: number,
    name: string,
    endpoint: string,
    apiKey: string
}

export class CPMS {

    public static async findByName(name: string): Promise<ICPMS | null> {
        const connection = await DBAccess.getConnection();

        const [result]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
            "SELECT * FROM CPMS WHERE name = ?",
            [name]);

        connection.release();

        if (result.length == 0 || !result) {
            return null;
        }
        return {
            id: result[0].id,
            name: result[0].name,
            endpoint: result[0].endpoint,
            apiKey: result[0].apiKey
        };
    }

    public static async findAll(): Promise<ICPMS[]> {
        const connection = await DBAccess.getConnection();

        const [result]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
            "SELECT * FROM CPMS");

        connection.release();

        if (result.length == 0 || !result) {
            return [];
        }
        return result.map((resultItem) => {
            return {
                id: resultItem.id,
                name: resultItem.name,
                endpoint: resultItem.endpoint,
                apiKey: resultItem.apiKey
            }
        });
    }
}