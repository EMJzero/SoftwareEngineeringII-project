import { DBAccess } from "../DBAccess";
import { FieldPacket, RowDataPacket } from "mysql2/promise";
import { hashSync } from "bcrypt";
import env from "../helper/env";

export interface IUser {
    id: number,
    username: string,
    email: string,
    password: string,
    creditCardNumber: string,
    creditCardCVV: string,
    creditCardExpiration: string,
    creditCardBillingName: string
}

export class User {

    public static async findByUsername(username: string): Promise<IUser | null> {
        const connection = await DBAccess.getConnection();

        const [result]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
            "SELECT * FROM users WHERE userName = ?",
            [username]);

        connection.release();

        if (result.length == 0 || !result) {
            return null;
        }
        return {
            id: result[0].id,
            creditCardBillingName: result[0].paymentCardOwnerName,
            creditCardCVV: result[0].paymentCardCvv,
            creditCardExpiration: result[0].paymentCardExpirationDate,
            creditCardNumber: result[0].paymentCardNumber,
            email: result[0].email,
            password: result[0].password,
            username: result[0].userName
        };
    }

    public static async checkCredentials(username: string, passwordClearText: string): Promise<boolean> {
        const passwordHash = hashSync(passwordClearText, env.SALT_ROUNDS);
        const retrievedUser = await User.findByUsername(username);
        return !(!retrievedUser || retrievedUser.password != passwordHash);
    }

    public static checkUserFields(user: IUser): boolean {
        const emailRegex = /^[-!#$%&'*+/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
        const usernameRegex = /[a-zA-Z0-9.\-_]*/;
        const creditCardNumberRegex = /^(?:4[0-9]{12}(?:[0-9]{3})?|[25][1-7][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/;
        const creditCardCVVValid = /^[0-9]{3}[0-9]?$/;
        const creditCardExpirationValid = /^(01|02|03|04|05|06|07|08|09|10|11|12)\/[0-9]{2}$/;
        const creditCardBillingNameValid = /^[a-zA-Z]+\s[a-zA-Z]+$/;

        return emailRegex.test(user.email) && usernameRegex.test(user.email) && creditCardNumberRegex.test(user.creditCardNumber) && creditCardCVVValid.test(user.creditCardCVV) && creditCardExpirationValid.test(user.creditCardExpiration) && creditCardBillingNameValid.test(user.creditCardBillingName);
    }

    public static async registerNewUser(user: IUser): Promise<boolean> {
        const connection = await DBAccess.getConnection();

        const [result]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
            "INSERT INTO users VALUES (default, ?, ?, ?, ?, ?, ?)",
            [user.username, user.email, user.password, user.creditCardNumber, user.creditCardCVV, user.creditCardExpiration.replace("/", ""), user.creditCardBillingName]);

        connection.release();

        return !(result.length == 0 || !result);

    }
}