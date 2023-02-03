import { DBAccess } from "../DBAccess";
import { FieldPacket, RowDataPacket } from "mysql2/promise";

/**
 * Represent a user as it is extracted from the DB.
 */
export interface IAccount {
    cardNumber: string,
    owner: string,
    expiration: string,
    cvv: number
}

/**
 * Model class representing a user registered with the system, it also exposes the methods
 * to register new users and check the credentials of already registered ones and retrieving users.
 *
 * @class
 */
export class Account {

    /**
     * Checks whether a user account data is correct.
     *
     * @param account
     */
    public static async checkAccount(account: IAccount): Promise<boolean> {
        const connection = await DBAccess.getConnection();

        const [result]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
            "SELECT * FROM accounts WHERE cardNumber = ? and owner = ? and expiration = ? and cvv = ?",
            [account.cardNumber, account.owner, account.expiration, account.cvv]);

        connection.release();

        return !(result.length == 0 || !result);
    }

    public static async billAccount(account: IAccount, incrementAmount: number): Promise<void> {
        const connection = await DBAccess.getConnection();

        const [result]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
            "UPDATE accounts SET totalBilled = totalBilled + ? WHERE cardNumber = ? and owner = ? and expiration = ? and cvv = ?",
            [incrementAmount, account.cardNumber, account.owner, account.expiration, account.cvv]);

        connection.release();
    }
}