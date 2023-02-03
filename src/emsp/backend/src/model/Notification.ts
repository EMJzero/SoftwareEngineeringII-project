import {DBAccess} from "../DBAccess";
import {FieldPacket, RowDataPacket} from "mysql2/promise";
import {hashSync} from "bcrypt";
import env from "../helper/env";
import {IUser} from "./User";

/**
 * Represent a notification as it is extracted from the DB.
 */
export interface INotification {
    notificationId: number,
    userId: number,
    content: string,
    generationDate: number
}

/**
 * Model class collecting methods to create, fetch and delete user notifications from the DB.
 *
 * @class
 */
export class Notification {

    /**
     * Retrieves all notifications for a user
     * {@link INotification} is used to store the result.
     *
     * @param userId
     */
    public static async findByUser(userId: number): Promise<INotification[]> {
        const connection = await DBAccess.getConnection();

        const [result]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
            "SELECT * FROM notifications WHERE userId = ?",
            [userId]);

        connection.release();

        if (result.length == 0 || !result) {
            return [];
        }
        return result.map((item) => {
            return {
                notificationId: item.id,
                userId: item.userId,
                content: item.content,
                generationDate: item.generationDate
            };
        });
    }

    /**
     * Stores a new notification in the DB.
     * Returns true if the operation succeeded.
     *
     * @param userId
     * @param content
     */
    public static async registerNotification(userId: number, content: string): Promise<boolean> {
        const connection = await DBAccess.getConnection();

        const [result]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
            "INSERT INTO notifications VALUES (default, ?, ?, UNIX_TIMESTAMP() * 1000)",
            [userId, content]);

        connection.release();

        const json: any = result;

        return json.affectedRows == 1;
    }

    /**
     * Removes all notifications for a given user
     * @param userId
     */
    public static async clearNotifications(userId: number): Promise<void> {
        const connection = await DBAccess.getConnection();

        const [result]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
            "DELETE FROM notifications WHERE userId = ?",
            [userId]);

        connection.release();
    }
}