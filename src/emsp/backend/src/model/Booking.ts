import { DBAccess } from "../DBAccess";
import { FieldPacket, RowDataPacket } from "mysql2/promise";

export interface IBooking {
    id: number,
    userId: number,
    startDate: string,
    endDate: string,
    isActive: boolean,
    cpmsId: number,
    csId: number,
    socketId: number
}

//TODO: Simple template for Bookings. Currently extracts all bookings of a user, need to complete with all other methods
//TODO: You should also send the socket info when retrieving the booking data before sending it to the client
//TODO: Add image URL as string in the DB to display images in the bookings list, and CS name to reflect the DD??
export class Booking {

    public static async findByUser(userId: number): Promise<IBooking[]> {
        const connection = await DBAccess.getConnection();

        const [result]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
            "SELECT * FROM bookings WHERE userId = ?",
            [userId]);

        connection.release();

        if (result.length == 0 || !result) {
            return [];
        }
        return result.map((resultItem) => {
            return {
                id: resultItem.id,
                userId: resultItem.userId,
                startDate: resultItem.startDate,
                endDate: resultItem.endDate,
                isActive: resultItem.isActive,
                cpmsId: resultItem.cpmsId,
                csId: resultItem.csId,
                socketId: resultItem.socketId
            };
        });
    }
}