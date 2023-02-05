import {DBAccess} from "../DBAccess";
import {FieldPacket, RowDataPacket} from "mysql2/promise";
import env from "../helper/env";
import {IUser} from "./User";
import CSNotification from "../routes/CSNotification";

// Simple template for Bookings. Currently extracts all bookings of a user, need to complete with all other methods
// You should also send the socket info when retrieving the booking data before sending it to the client
// Add image URL as string in the DB to display images in the bookings list, and CS name to reflect the DD??
/**
 * Model class that represents a booking stored within the DB.
 * It offers all the methods needed to perform predefined queries on the DB and return the desired information
 * usually in the form of instances of this class.
 *
 * @class
 */
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

    /**
     * Starts a regular timer that will clean up expired bookings regularly
      */
    public static startCleanupTimer() {
        //TODO: Try to make FE tests work with the backend running
        const timerSchedule = 6 * 3600; //Seconds in 6 hrs;
        setInterval(async () => {
            const usersToBill = await this.deleteExpiredBookingsAndUserWithCount();
            if (usersToBill.deleted) {
                const paymentAmountPerSlot = 20 //20$ fine
                for (const [userToBill, numberOfBookings] of usersToBill.usersWithCount) {
                    const totalFineAmount = paymentAmountPerSlot * numberOfBookings;
                    await CSNotification.billUser(userToBill, totalFineAmount, undefined);
                }
            }
        }, timerSchedule * 1000);
    }

    /**
     * Method to retrieve all bookings made by the provided user.
     *
     * @param userId
     */
    public static async findByUser(userId: number): Promise<Booking[]> {
        const connection = await DBAccess.getConnection();

        const [result]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
            "SELECT * FROM bookings WHERE userId = ? AND (startDate >= UNIX_TIMESTAMP() * 1000 OR endDate >= UNIX_TIMESTAMP() * 1000) ORDER BY startDate",
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

    // csID could be omitted as it is already implied by the socketID, kept as a double check.
    /**
     * Retrive all the pairs (startTime, endTime) that represent the available timeslots for the specified socket of the indicated CS.
     * See {@link DateIntervalPerSocket}.
     *
     * @param cpmsID
     * @param csID
     * @param socketID
     * @param startDate
     * @param endDate
     */
    public static async getAvailableTimeSlots(cpmsID: number, csID: number, socketID: number, startDate: Date, endDate: Date): Promise<DateIntervalPerSocket[]> {
        const connection = await DBAccess.getConnection();

        const [result]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
            "SELECT start, end FROM availabilityautomanaged WHERE cpms = ? AND cs = ? AND socket = ? AND ((end >= ? AND end <= ?) OR (start >= ? AND start <= ?)) UNION (SELECT ?, ? WHERE NOT EXISTS (SELECT * FROM bookings WHERE cpmsId = ? AND csId = ? AND socketId = ?))",
            [cpmsID, csID, socketID, startDate.valueOf(), endDate.valueOf(), startDate.valueOf(), endDate.valueOf(), startDate.valueOf(), endDate.valueOf(), cpmsID, csID, socketID]);

        connection.release();

        // Here we exclude intervals that violate the env.TIME
        return result.map((res) => new DateIntervalPerSocket(new Date(Math.max(res.start, startDate.valueOf())), new Date(Math.min(res.end, endDate.valueOf()))))
            .filter((res) => res.endDate.valueOf() - res.startDate.valueOf() >= env.TIME_SLOT_SIZE * 60 * 1000);
    }

    /**
     * Method retrieving all the bookings made from a user with extra filters applied regarding their date.
     *
     * @param userId
     * @param referenceDate
     * @param intervalDays
     */
    public static async findByUserFiltered(userId: number, referenceDate: Date, intervalDays: number): Promise<Booking[]> {
        const connection = await DBAccess.getConnection();

        const finalDate = new Date(referenceDate);
        finalDate.setDate(finalDate.getDate() + intervalDays);
        console.log(referenceDate, finalDate);
        const [result]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
            "SELECT * FROM bookings WHERE userId = ? AND startDate >= ? AND endDate <= ? ORDER BY startDate",
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

    /**
     * Method retrieving from the DB the booking (its exactly one) that is current for the given user.
     * "Current" meaning that its start and end date fall before and after the current date respectively.
     *
     * @param userId
     */
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

    /**
     * Method retrieving the (one or none) active booking for the given user, that being the booking with a currently
     * ongoing charging process.
     *
     * @param userId
     */
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

    /**
     * Method retrieving the (one or none) user that has a bookinga ctive on the specified station, that being the booking with a currently
     * ongoing charging process.
     *
     * @param stationId
     * @param cpmsId
     * @param socketId
     */
    public static async findUserWithActive(stationId: number, cpmsId: number, socketId: number): Promise<{ user: IUser, bookingId: number } | undefined> {
        const connection = await DBAccess.getConnection();

        const [result]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
            "SELECT u.*, b.id as bookingID FROM bookings as b JOIN users u on b.userId = u.id WHERE b.cpmsId = ? AND b.csId = ? AND b.socketId = ? AND isActive",
            [cpmsId, stationId, socketId]);

        connection.release();

        if (result.length == 0 || !result) {
            return undefined;
        }

        return {
            user: {
                id: result[0].id,
                creditCardBillingName: result[0].paymentCardOwnerName,
                creditCardCVV: result[0].paymentCardCvv,
                creditCardExpiration: result[0].paymentCardExpirationDate,
                creditCardNumber: result[0].paymentCardNumber,
                email: result[0].email,
                password: result[0].password,
                username: result[0].userName
            },
            bookingId: result[0].bookingID
        };
    }

    /**
     * Deletes the booking with the specified id from the DB.
     *
     * @param userId
     * @param bookingId
     */
    public static async deleteBooking(userId: number, bookingId: number): Promise<boolean> {
        const connection = await DBAccess.getConnection();

        const [result]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
            "DELETE FROM bookings WHERE userId = ? AND id = ?",
            [userId, bookingId]);

        connection.release();

        const json: any = result;

        return json.affectedRows == 1;
    }

    /**
     * Deletes all expired bookings
     *
     */
    public static async deleteExpiredBookingsAndUserWithCount(): Promise<{ deleted: boolean, usersWithCount: [IUser, number][] }> {
        const connection = await DBAccess.getConnection();
        await connection.beginTransaction();

        const [selectResult]: [RowDataPacket[], FieldPacket[]] = await connection.execute("SELECT DISTINCT u.*, count(*) as bookingsCount FROM users as u JOIN bookings as b on u.id = b.userId WHERE b.endDate < UNIX_TIMESTAMP() * 1000 GROUP BY u.id", [])
        const [result]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
            "DELETE FROM bookings WHERE endDate < UNIX_TIMESTAMP() * 1000",
            []);

        await connection.commit();
        connection.release();

        const json: any = result;

        return {
            deleted: json.affectedRows >= 1,
            usersWithCount: selectResult.map((userAndCount) => {
                return [{
                    id: userAndCount.id,
                    creditCardBillingName: userAndCount.paymentCardOwnerName,
                    creditCardCVV: userAndCount.paymentCardCvv,
                    creditCardExpiration: userAndCount.paymentCardExpirationDate,
                    creditCardNumber: userAndCount.paymentCardNumber,
                    email: userAndCount.email,
                    password: userAndCount.password,
                    username: userAndCount.userName
                }, userAndCount.bookingsCount]
            })
        };
    }

    /**
     * Creates a new booking for the provided user and stores it into the DB with the provided information regarding it.
     *
     * @param userId
     * @param startDate
     * @param endDate
     * @param cpmsID
     * @param csID
     * @param socketID
     */
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

    /**
     * Marks as active a booking in the DB.
     *
     * @param userId
     * @param bookingId
     */
    public static async activateBooking(userId: number, bookingId: number): Promise<boolean> {
        const connection = await DBAccess.getConnection();

        const [result]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
            "UPDATE bookings SET isActive = true WHERE userId = ? AND id = ?",
            [userId, bookingId]);

        connection.release();

        const json: any = result;

        return json.affectedRows == 1;
    }

    private static secondsSinceEpoch(date: Date) {
        return Math.round(date.valueOf() / 1000);
    }
}

/**
 * Class used to store the (start, end) representing time intervals.
 *
 * @class
 */
export class DateIntervalPerSocket {
    readonly startDate: Date;
    readonly endDate: Date;

    constructor(startDate: Date, endDate: Date) {
        this.startDate = startDate;
        this.endDate = endDate;
    }
}