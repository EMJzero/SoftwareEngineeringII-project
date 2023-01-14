import { DBAccess } from "../DBAccess";
import { query, Router } from "express";
import Authentication from "../helper/authentication";
import { FieldPacket, RowDataPacket } from "mysql2/promise";

export class CS {
    id: number;
    locationLatitude: number;
    locationLongitude: number;
    nominalPrice: number;
    userPrice: number;
    offerExpirationDate: Date | null;

    constructor(id: number, locationLatitude: number, locationLongitude: number, nominalPrice: number, userPrice: number, offerExpirationDate: Date) {
        this.id = id;
        this.locationLatitude = locationLatitude;
        this.locationLongitude = locationLongitude;
        this.nominalPrice = nominalPrice;
        this.userPrice = userPrice;
        this.offerExpirationDate = offerExpirationDate;
    }

    public static async getCSList(location: [number, number], locationRange: number, priceRange: [number, number]): Promise<CS[]> {
        return await this.queryForCSs("SELECT * FROM cs WHERE (userPrice >= ? AND userPrice <= ?) AND (locationLatitude >= ? - ? AND locationLatitude <= ? + ?) AND (locationLongitude >= ? - ? AND locationLongitude <= ? + ?)",
            [priceRange[0], priceRange[1], location[0], locationRange, location[0], locationRange, location[1], locationRange, location[1], locationRange]);
    }
    
    private static async queryForCSs(queryString: string, parameters: unknown[]) {
        const connection = await DBAccess.getConnection();

        const [result, _]: [RowDataPacket[], FieldPacket[]] = await connection.execute(queryString, parameters);

        connection.release();

        return result.map((cs) => new CS(cs.id, cs.locationLatitude, cs.locationLongitude, cs.nominalPrice, cs.userPrice, cs.offerExpirationDate));
    }
}

/*CS.getCSList([30, 140], 20, [2, 20]).then(
    async (result) => {
        console.log(result);
        await DBAccess.closePool();
    }
);*/