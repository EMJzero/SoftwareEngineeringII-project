import { DBAccess } from "../DBAccess";
import { FieldPacket, RowDataPacket, ResultSetHeader } from "mysql2/promise";
import env from "../helper/env";

// Simple template for Bookings. Currently extracts all bookings of a user, need to complete with all other methods
// You should also send the socket info when retrieving the booking data before sending it to the client
// Add image URL as string in the DB to display images in the bookings list, and CS name to reflect the DD??
export class Booking {
    id: number;
    userId: number;
    startDate: number;
    endDate: number;
    isActive: boolean;
    cpmsId: number;
    csId: number;
    socketId: number;

    constructor(id: number, userId: number, startDate: number, endDate: number, isActive: boolean, cpmsId: number, csId: number, socketId: number) {
        this.id = id;
        this.userId = userId;
        this.startDate = startDate;
        this.endDate = endDate;
        this.isActive = isActive;
        this.cpmsId = cpmsId;
        this.csId = csId;
        this.socketId = socketId;
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
        const r = result.map((resultItem) => {
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
        return r;
    }

    /*public static async findBookingById(bookingId: number): Promise<Booking | null> {
        const connection = await DBAccess.getConnection();

        const [result]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
            "SELECT * FROM bookings WHERE id = ?",
            [bookingId]);

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
    }*/

    /*public static async getAvailableTimeSlots(cpmsID: number, csID: number): Promise<DateIntervalPerSocket[]> {
        const connection = await DBAccess.getConnection();

        const [result]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
            "SELECT start, end, socketId FROM availableTimeSlots WHERE cpmsId = ? AND csId = ?",
            [cpmsID, csID]);

        connection.release();

        // Here we exclude intervals that violate the env.TIME
        return result.map((res) => new DateIntervalPerSocket(new Date(res.start), new Date(res.end), res.socketId))
            .filter((res) => res.endDate.valueOf() - res.startDate.valueOf() >= env.TIME_SLOT_SIZE * 60 * 1000);
    }*/

    public static async getAvailableTimeSlots(cpmsID: number, csID: number, socketID: number, startDate: Date, endDate: Date): Promise<DateIntervalPerSocket[]> {
        const connection = await DBAccess.getConnection();

        const [result]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
            "WITH timeSlots(start, end) AS (SELECT b1.endDate, b2.startDate FROM bookings b1 JOIN bookings b2 ON b1.cpmsId = b2.cpmsId AND b1.csId = b2.csId AND b1.socketId = b2.socketId\n" +
            "WHERE b1.endDate < b2.startDate AND b1.cpmsId = ? AND b1.csId = ? AND b1.socketId = ? AND b1.endDate >= ? AND b2.startDate <= ? AND\n" +
            "NOT EXISTS\n" +
            "(SELECT * FROM bookings b3 WHERE b1.cpmsId = b3.cpmsId AND b1.csId = b3.csId AND b1.socketId = b3.socketId AND (b3.startDate BETWEEN b1.endDate AND b2.startDate OR b3.endDate BETWEEN b1.endDate AND b2.startDate))\n" +
            "UNION\n" +
            "(SELECT endDate, ? FROM bookings WHERE cpmsId = ? AND csId = ? AND socketId = ? AND endDate < ? ORDER BY endDate DESC LIMIT 1)\n" +
            "UNION\n" +
            "(SELECT ?, startDate FROM bookings WHERE cpmsId = ? AND csId = ? AND socketId = ? AND startDate > ? ORDER BY startDate ASC LIMIT 1))\n" +
            "SELECT * FROM timeSlots",
            [cpmsID, csID, socketID, startDate.valueOf(), endDate.valueOf(),
                endDate.valueOf(), cpmsID, csID, socketID, endDate.valueOf(),
                startDate.valueOf(), cpmsID, csID, socketID, startDate.valueOf()]);

        connection.release();

        // Here we exclude intervals that violate the env.TIME
        return result.map((res) => new DateIntervalPerSocket(new Date(res.start), new Date(res.end)))
            .filter((res) => res.endDate.valueOf() - res.startDate.valueOf() >= env.TIME_SLOT_SIZE * 60 * 1000);
    }

    public static async findByUserFiltered(userId: number, referenceDate: Date, intervalDays: number): Promise<Booking[]> {
        const connection = await DBAccess.getConnection();

        const finalDate = new Date(referenceDate);
        finalDate.setDate(finalDate.getDate() + intervalDays);
        console.log(referenceDate, finalDate);
        const [result]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
            "SELECT * FROM bookings WHERE userId = ? AND startDate >= ? AND endDate <= ?",
            [userId,
                referenceDate.valueOf(),
                finalDate.valueOf()]);

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
            "SELECT * FROM bookings WHERE startDate <= UNIX_TIMESTAMP() * 1000 AND endDate > UNIX_TIMESTAMP() * 1000 AND userId = ?",
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

    public static async findActiveByUser(userId: number): Promise<Booking | undefined> {
        const connection = await DBAccess.getConnection();

        const [result]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
            "SELECT * FROM bookings WHERE userId = ? AND isActive",
            [userId]);

        connection.release();

        if (result.length == 0 || !result) {
            return undefined;
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

    public static async deleteBooking(userId: number, bookingId: number): Promise<boolean> {
        const connection = await DBAccess.getConnection();

        const [result]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
            "DELETE FROM bookings WHERE userId = ? AND id = ?",
            [userId, bookingId]);

        connection.release();

        const json: any = result;

        return json.affectedRows == 1;
    }

    public static async createBooking(userId: number, startDate: Date, endDate: Date, cpmsID: number, csID: number, socketID: number): Promise<boolean> {
        const connection = await DBAccess.getConnection();

        const [check]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
            "SELECT id FROM bookings WHERE ((startDate >= ? AND startDate <= ?) OR (endDate >= ? AND startDate <= ?)) AND ((cpmsId = ? AND csId = ? AND socketId = ?) OR (userId = ?))",
            [startDate.valueOf(),
                endDate.valueOf(),
                startDate.valueOf(),
                endDate.valueOf(),
                cpmsID,
                csID,
                socketID,
                userId]);

        if(check.length != 0)
            return false;

        const [result]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
            "INSERT INTO bookings VALUES (default, ?, ?, ?, ?, ?, ?, ?)",
            [userId, startDate.valueOf(), endDate.valueOf(), 0, cpmsID, csID, socketID]);

        connection.release();

        const json: any = result;

        return json.affectedRows == 1;
    }

    public static async activateBooking(userId: number, bookingId: number): Promise<boolean> {
        const connection = await DBAccess.getConnection();

        const [result]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
            "UPDATE bookings SET isActive = true WHERE userId = ? AND id = ?",
            [userId, bookingId]);

        connection.release();

        const json: any = result;
        console.log(result);
        return json.affectedRows == 1;
    }
}

export class DateIntervalPerSocket {
    readonly startDate: Date;
    readonly endDate: Date;

    constructor(startDate: Date, endDate: Date) {
        this.startDate = startDate;
        this.endDate = endDate;
    }
}