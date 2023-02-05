import { DBAccess } from "../DBAccess";
import mysql, { FieldPacket, RowDataPacket } from "mysql2/promise";
import * as fs from "fs";

/**
 * Model class representing CS that is stored in the DB, it offers all the methods needed
 * to retrieve data regarding one or more CSs from the DB via adequate queries.
 *
 * @class
 */
export class CS {
    id: number;
    name: string;
    locationLatitude: number;
    locationLongitude: number;
    nominalPrice: number;
    userPrice: number;
    offerExpirationDate: number | null;
    sockets: Socket[] | null;
    imageURL: string;

    constructor(id: number, name: string, locationLatitude: number, locationLongitude: number, nominalPrice: number, userPrice: number, offerExpirationDate: number, sockets: null | Socket[], imageURL: string) {
        this.id = id;
        this.name = name;
        this.locationLatitude = locationLatitude;
        this.locationLongitude = locationLongitude;
        this.nominalPrice = nominalPrice;
        this.userPrice = userPrice;
        this.offerExpirationDate = offerExpirationDate;
        this.sockets = sockets;
        this.imageURL = imageURL;
    }

    /**
     * Given a set of filters, recovers all the CSs and their information from the DB that satisfy those filters.
     *
     * @param locationLatitude
     * @param locationLongitude
     * @param locationRange
     * @param priceLowerBound
     * @param priceUpperBound
     */
    public static async getCSList(locationLatitude: number, locationLongitude: number, locationRange: number, priceLowerBound: number, priceUpperBound: number): Promise<CS[]> {
        const connection = await DBAccess.getConnection();

        const [result]: [RowDataPacket[], FieldPacket[]] = await connection.execute("SELECT * FROM cs WHERE (userPrice >= ? AND userPrice <= ?) AND (locationLatitude >= ? - ? AND locationLatitude <= ? + ?) AND (locationLongitude >= ? - ? AND locationLongitude <= ? + ?)",
            [priceLowerBound, priceUpperBound, locationLatitude, locationRange, locationLatitude, locationRange, locationLongitude, locationRange, locationLongitude, locationRange]);

        connection.release();

        return result.map((cs) => new CS(cs.id, cs.name, cs.locationLatitude, cs.locationLongitude, cs.nominalPrice, cs.userPrice, cs.offerExpirationDate, null, cs.imageURL));
    }

    //DEBUG ONLY!!!!!
    /*public static async dumpDB(): Promise<void> {
        const connection = await DBAccess.getConnection();

        const [result]: [RowDataPacket[], FieldPacket[]] = await connection.execute("SELECT * FROM cs", []);

        connection.release();

        const list = result.map((cs) => new CS(cs.id, cs.name, cs.locationLatitude, cs.locationLongitude, cs.nominalPrice, cs.userPrice, cs.offerExpirationDate, null, cs.imageURL));

        const resultList: CS[] = [];
        for (const cs of list) {
            const detailedCS = await CS.getCSDetails(cs.id);
            resultList.push(detailedCS);
        }

        const jsonString = JSON.stringify(resultList, null, "\t");
        fs.writeFileSync("C:\\Users\\alessandrosassi\\Desktop\\csdump.json", jsonString);
    }*/

    /**
     * For the speficified CS, recovers from the DB all the data regarding it.
     *
     * @param CSID
     */
    public static async getCSDetails(CSID: number): Promise<CS | null> {
        const connection = await DBAccess.getConnection();

        //const [result, _]: [RowDataPacket[], FieldPacket[]] = await connection.execute("SELECT c.id, c.locationLatitude, c.locationLongitude, c.nominalPrice, c.userPrice, c.offerExpirationDate, s.id AS socketid, t.connector, t.maxpower FROM cs c JOIN cssockets s JOIN socketstype t ON c.id = s.csid AND s.typeid = t.id WHERE c.id = ?",
        //    [CSID]);

        const [resultCS]: [RowDataPacket[], FieldPacket[]] = await connection.execute("SELECT * FROM cs WHERE id = ?",
            [CSID]);
        const [resultSockets]: [RowDataPacket[], FieldPacket[]] = await connection.execute("SELECT s.id, t.connector, t.maxpower FROM cssockets s JOIN socketstype t ON s.typeid = t.id WHERE s.csid = ?",
            [CSID]);

        if (resultCS.length == 0 || !resultCS) {
            return null;
        }

        const cs = new CS(resultCS[0].id, resultCS[0].name, resultCS[0].locationLatitude, resultCS[0].locationLongitude, resultCS[0].nominalPrice, resultCS[0].userPrice, resultCS[0].offerExpirationDate,
            resultSockets.map((socket) => new Socket(socket.id, new SocketType(socket.connector, socket.maxpower))), resultCS[0].imageURL);

        connection.release();

        return cs;
    }

    /**
     * Returns true if the specified socket is owned by the specified CS. False otherwise.
     *
     * @param CSID
     * @param SocketIDs
     */
    public static async verifyCSandSockets(CSID: number, SocketIDs: number[]): Promise<boolean> {
        const connection = await DBAccess.getConnection();

        //const [result]: [RowDataPacket[], FieldPacket[]] = await connection.execute("SELECT count(*) AS res FROM cs c JOIN cssockets s ON c.id = s.csid WHERE c.id = ? AND s.id IN (?)",
        //[CSID, SocketIDs.map((id) => id.toString()).reduce((acc, id) => acc += ", " + id)]);
        //[CSID, SocketIDs]);
        
        const sql = mysql.format("SELECT count(*) AS res FROM cs c JOIN cssockets s ON c.id = s.csid WHERE c.id = ? AND s.id IN (?)",
            [CSID, SocketIDs]);
        const [result]: [RowDataPacket[], FieldPacket[]] = await connection.query(sql);

        connection.release();

        return result[0].res == SocketIDs.length;
    }
}

/**
 * Local class that represents a socket when its information has not been fully retrieved from the real CS,
 * but just sourced from the DB.
 */
class Socket {
    id: number;
    type: SocketType;

    constructor(id: number, type: SocketType) {
        this.id = id;
        this.type = type;
    }
}

/**
 * Local class that represents a socket type when its information has not been fully retrieved from the real CS,
 * but just sourced from the DB.
 */
class SocketType {
    connector: string;
    maxPower: number;

    constructor(connector: string, maxPower: number) {
        this.connector = connector;
        this.maxPower = maxPower;
    }
}

/*CS.getCSList([30, 140], 20, [2, 20]).then(
    async (result) => {
        console.log(result);
        await DBAccess.closePool();
    }
);*/

/*CS.getCSDetails(1).then(
    async (result) => {
        console.log(result);
        await DBAccess.closePool();
    }
);*/

/*CS.verifyCSandSockets(1, [1, 2]).then(
    async (result) => {
        console.log(result);
        await DBAccess.closePool();
    }
);*/