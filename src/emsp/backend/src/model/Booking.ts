import { DBAccess } from "../DBAccess";
import { FieldPacket, RowDataPacket } from "mysql2/promise";
import env from "../helper/env";

//TODO: Simple template for Bookings. Currently extracts all bookings of a user, need to complete with all other methods
//TODO: You should also send the socket info when retrieving the booking data before sending it to the client
//TODO: Add image URL as string in the DB to display images in the bookings list, and CS name to reflect the DD??
export class Booking {
    private _id: number;
    private _userId: number;
    private _startDate: string;
    private _endDate: string;
    private _isActive: boolean;
    private _cpmsId: number;
    private _csId: number;
    private _socketId: number;

    constructor(id: number, userId: number, startDate: string, endDate: string, isActive: boolean, cpmsId: number, csId: number, socketId: number) {
        this._id = id;
        this._userId = userId;
        this._startDate = startDate;
        this._endDate = endDate;
        this._isActive = isActive;
        this._cpmsId = cpmsId;
        this._csId = csId;
        this._socketId = socketId;
    }

    public static async findByUser(userId: number): Promise<Booking[]> {
        const connection = await DBAccess.getConnection();

        const [result]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
            "SELECT * FROM bookings WHERE userId = ? AND startDate >= curdate()",
            [userId]);

        connection.release();

        if (result.length == 0 || !result) {
            return [];
        }
        return result.map((resultItem) => {
            return new Booking(
                resultItem.id,
                resultItem.userId,
                resultItem.startDate,
                resultItem.endDate,
                resultItem.isActive,
                resultItem.cpmsId,
                resultItem.csId,
                resultItem.socketId
            );
        });
    }

    public static async getAvailableTimeSlots(cpmsID: number, csID: number): Promise<DateIntervalPerSocket[]> {
        const connection = await DBAccess.getConnection();

        const [result]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
            "SELECT start, end, socketId FROM availableTimeSlots WHERE cpmsId = ? AND csId = ?",
            [cpmsID, csID]);

        connection.release();

        // Here we exclude intervals that violate the env.TIME
        return result.map((res) => new DateIntervalPerSocket(res.start, res.end, res.socketId))
            .filter((res) => res.endDate.valueOf() - res.startDate.valueOf() >= env.TIME_SLOT_SIZE * 60 * 1000);
    }

    public static async findByUserFiltered(userId: number, referenceDate: Date, intervalDays: number): Promise<Booking[]> {
        const connection = await DBAccess.getConnection();

        const finalDate = new Date(referenceDate);
        finalDate.setDate(finalDate.getDate() + intervalDays);

        const [result]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
            "SELECT * FROM bookings WHERE userId = ? AND startDate >= ? AND endDate <= ?",
            [userId,
                referenceDate.toISOString().slice(0, 19).replace("T", " "),
                finalDate.toISOString().slice(0, 19).replace("T", " ")]);

        connection.release();

        if (result.length == 0 || !result) {
            return [];
        }
        return result.map((resultItem) => {
            return new Booking(
                resultItem.id,
                resultItem.userId,
                resultItem.startDate,
                resultItem.endDate,
                resultItem.isActive,
                resultItem.cpmsId,
                resultItem.csId,
                resultItem.socketId
            );
        });
    }

    public static async findCurrentByUser(userId: number): Promise<Booking | null> {
        const connection = await DBAccess.getConnection();

        const [result]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
            "SELECT * FROM bookings WHERE startDate <= curdate() AND endDate > curdate() AND userId = ?",
            [userId]);

        connection.release();

        if (result.length == 0 || !result) {
            return null;
        }

        return new Booking(
            result[0].id,
            result[0].userId,
            result[0].startDate,
            result[0].endDate,
            result[0].isActive,
            result[0].cpmsId,
            result[0].csId,
            result[0].socketId
        );
    }

    public static async findActiveByUser(userId: number): Promise<Booking | null> {
        const connection = await DBAccess.getConnection();

        const [result]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
            "SELECT * FROM bookings WHERE userId = ? AND isActive",
            [userId]);

        connection.release();

        if (result.length == 0 || !result) {
            return null;
        }

        return new Booking(
            result[0].id,
            result[0].userId,
            result[0].startDate,
            result[0].endDate,
            result[0].isActive,
            result[0].cpmsId,
            result[0].csId,
            result[0].socketId
        );
    }

    public static async deleteBooking(userId: number, startDate: Date, endDate: Date, cpmsID: number, csID: number, socketID: number): Promise<boolean> {
        const connection = await DBAccess.getConnection();

        const [result]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
            "DELETE FROM bookings WHERE userId = ? AND startDate = ? AND endDate = ? AND cpmsId = ? AND csId = ? AND socketId = ?",
            [userId, startDate, endDate, cpmsID, csID, socketID]);

        connection.release();

        console.log(result);

        //TODO: IMPLEMENT THIS CHECK with something like affectedRows!
        return true;
    }

    public static async createBooking(userId: number, startDate: Date, endDate: Date, cpmsID: number, csID: number, socketID: number): Promise<boolean> {
        const connection = await DBAccess.getConnection();

        const [check]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
            "SELECT id FROM bookings WHERE (startDate BETWEEN ? AND ? OR endDate BETWEEN ? AND ?) AND ((cpmsId = ? AND csId = ? AND socketId = ?) OR userId = ?)",
            [userId,
                startDate.toISOString().slice(0, 19).replace("T", " "),
                endDate.toISOString().slice(0, 19).replace("T", " "),
                startDate.toISOString().slice(0, 19).replace("T", " "),
                endDate.toISOString().slice(0, 19).replace("T", " "),
                cpmsID,
                csID,
                socketID,
                userId]);

        if(check.length != 0)
            return false;

        const [result]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
            "INSERT INTO bookings VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [userId, startDate, endDate, cpmsID, csID, socketID]);

        connection.release();

        console.log(result);

        //TODO: IMPLEMENT THIS CHECK with something like affectedRows!
        return true;
    }

    get id(): number {
        return this._id;
    }

    get userId(): number {
        return this._userId;
    }

    get startDate(): string {
        return this._startDate;
    }

    get endDate(): string {
        return this._endDate;
    }

    get isActive(): boolean {
        return this._isActive;
    }

    get cpmsId(): number {
        return this._cpmsId;
    }

    get csId(): number {
        return this._csId;
    }

    get socketId(): number {
        return this._socketId;
    }
}

export class DateIntervalPerSocket {
    readonly startDate: Date;
    readonly endDate: Date;
    readonly socketId: number;

    constructor(startDate: Date, endDate: Date, socketId: number) {
        this.startDate = startDate;
        this.endDate = endDate;
        this.socketId = socketId;
    }
}