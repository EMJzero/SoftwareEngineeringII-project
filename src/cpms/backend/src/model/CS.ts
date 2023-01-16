import { DBAccess } from "../DBAccess";
import { FieldPacket, RowDataPacket } from "mysql2/promise";

export class CS {
    id: number;
    locationLatitude: number;
    locationLongitude: number;
    nominalPrice: number;
    userPrice: number;
    offerExpirationDate: Date | null;
    sockets: Socket[] | null;

    constructor(id: number, locationLatitude: number, locationLongitude: number, nominalPrice: number, userPrice: number, offerExpirationDate: Date, sockets: null | Socket[]) {
        this.id = id;
        this.locationLatitude = locationLatitude;
        this.locationLongitude = locationLongitude;
        this.nominalPrice = nominalPrice;
        this.userPrice = userPrice;
        this.offerExpirationDate = offerExpirationDate;
        this.sockets = sockets;
    }

    public static async getCSList(locationLatitude: number, locationLongitude: number, locationRange: number, priceLowerBound: number, priceUpperBound: number): Promise<CS[]> {
        const connection = await DBAccess.getConnection();

        const [result]: [RowDataPacket[], FieldPacket[]] = await connection.execute("SELECT * FROM cs WHERE (userPrice >= ? AND userPrice <= ?) AND (locationLatitude >= ? - ? AND locationLatitude <= ? + ?) AND (locationLongitude >= ? - ? AND locationLongitude <= ? + ?)",
            [priceLowerBound, priceUpperBound, locationLatitude, locationRange, locationLatitude, locationRange, locationLongitude, locationRange, locationLongitude, locationRange]);

        connection.release();

        return result.map((cs) => new CS(cs.id, cs.locationLatitude, cs.locationLongitude, cs.nominalPrice, cs.userPrice, cs.offerExpirationDate, null));
    }

    public static async getCSDetails(CSID: number): Promise<CS> {
        const connection = await DBAccess.getConnection();

        //const [result, _]: [RowDataPacket[], FieldPacket[]] = await connection.execute("SELECT c.id, c.locationLatitude, c.locationLongitude, c.nominalPrice, c.userPrice, c.offerExpirationDate, s.id AS socketid, t.connector, t.maxpower FROM cs c JOIN cssockets s JOIN socketstype t ON c.id = s.csid AND s.typeid = t.id WHERE c.id = ?",
        //    [CSID]);

        const [resultCS]: [RowDataPacket[], FieldPacket[]] = await connection.execute("SELECT * FROM cs WHERE id = ?",
            [CSID]);
        const [resultSockets]: [RowDataPacket[], FieldPacket[]] = await connection.execute("SELECT s.id, t.connector, t.maxpower FROM cssockets s JOIN socketstype t ON s.typeid = t.id WHERE s.csid = ?",
            [CSID]);

        const cs = new CS(resultCS[0].id, resultCS[0].locationLatitude, resultCS[0].locationLongitude, resultCS[0].nominalPrice, resultCS[0].userPrice, resultCS[0].offerExpirationDate,
            resultSockets.map((socket) => new Socket(socket.id, new SocketType(socket.connector, socket.maxpower))));

        connection.release();

        return cs;
    }
}

class Socket {
    id: number;
    type: SocketType;

    constructor(id: number, type: SocketType) {
        this.id = id;
        this.type = type;
    }
}

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