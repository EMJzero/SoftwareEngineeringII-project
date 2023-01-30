import { DBAccess } from "../DBAccess";
import { FieldPacket, RowDataPacket } from "mysql2/promise";

export interface ICPMS {
    id: number,
    name: string,
    endpoint: string,
    apiKey: string
}

export class CPMS {

    /*public static async findByName(name: string): Promise<ICPMS | null> {
        const connection = await DBAccess.getConnection();

        const [result]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
            "SELECT * FROM cpmses WHERE name = ?",
            [name]);

        connection.release();

        if (result.length == 0 || !result) {
            return null;
        }
        return {
            id: result[0].id,
            name: result[0].name,
            endpoint: result[0].APIendpoint,
            apiKey: result[0].APIkey
        };
    }*/

    public static async findById(id: number): Promise<ICPMS | null> {
        const connection = await DBAccess.getConnection();

        const [result]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
            "SELECT * FROM cpmses WHERE id = ?",
            [id]);

        connection.release();

        if (result.length == 0 || !result) {
            return null;
        }

        return {
            id: result[0].id,
            name: result[0].name,
            endpoint: result[0].APIendpoint,
            apiKey: result[0].APIkey
        };
    }

    public static async findAll(): Promise<ICPMS[]> {
        const connection = await DBAccess.getConnection();

        const [result]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
            "SELECT * FROM cpmses");

        connection.release();

        if (result.length == 0 || !result) {
            return [];
        }
        return result.map((resultItem) => {
            return {
                id: resultItem.id,
                name: resultItem.name,
                endpoint: resultItem.APIendpoint,
                apiKey: resultItem.APIkey
            };
        });
    }
}