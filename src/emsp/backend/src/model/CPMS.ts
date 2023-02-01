import { DBAccess } from "../DBAccess";
import { FieldPacket, RowDataPacket } from "mysql2/promise";

/**
 * Represents a CPMS extracted from the DB.
 */
export interface ICPMS {
    id: number,
    name: string,
    endpoint: string,
    apiKey: string,
    token: string | null
}

/**
 * Model class representing a CPMS known to the system and used as a data source for CSs.
 * The known CPMS are stored in the DB and retrieved via the queries present in this class's methods.
 *
 * @class
 */
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

    /**
     * Retrieves the a CPMS via its id.
     *
     * @param id
     */
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
            apiKey: result[0].APIkey,
            token: result[0].token
        };
    }

    public static async updateToken(id: number, token: string | null) {
        if (!token) return;

        const connection = await DBAccess.getConnection();

        const result: [RowDataPacket[], FieldPacket[]] = await connection.execute(
            "UPDATE cpmses SET token = ? WHERE id = ?",
            [token, id]);

        connection.release();
    }

    /**
     * Retrieves all known CPMSs.
     */
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
                apiKey: resultItem.APIkey,
                token: resultItem.token
            };
        });
    }
}