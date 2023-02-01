import { DBAccess } from "../DBAccess";
import { FieldPacket, RowDataPacket } from "mysql2/promise";
import { hashSync } from "bcrypt";
import env from "../helper/env";

/**
 * Represent a user as it is extracted from the DB.
 */
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

/**
 * Model class representing a user registered with the system, it also exposes the methods
 * to register new users and check the credentials of already registered ones and retrieving users.
 *
 * @class
 */
export class User {

    /**
     * Retrieves a user's entire tuple given its username.
     * {@link IUser} is used to store the result.
     *
     * @param username
     */
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

    /**
     * Verifies the provided credentials and returns a boolean representing the result of the check.
     * Used to authenticate users.
     *
     * @param username
     * @param passwordClearText
     */
    public static async checkCredentials(username: string, passwordClearText: string): Promise<boolean> {
        const passwordHash = hashSync(passwordClearText, env.SALT_ROUNDS);
        const retrievedUser = await User.findByUsername(username);
        return !(!retrievedUser || retrievedUser.password != passwordHash);
    }

    /**
     * Varifies the correct syntax of the fields of a new {@link IUser} instance.
     * Return true only if every field matches the expected regular expression.
     *
     * @param IUser
     */
    public static checkUserFields(user: IUser): boolean {
        const emailRegex = /^[-!#$%&'*+/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
        const usernameRegex = /[a-zA-Z0-9.\-_]*/;
        //const creditCardNumberRegex = /^(?:4[0-9]{12}(?:[0-9]{3})?|[25][1-7][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/;
        const creditCardNumberRegex = /^[0-9]{16}$/;
        const creditCardCVVValid = /^[0-9]{3}[0-9]?$/;
        const creditCardExpirationValid = /^(01|02|03|04|05|06|07|08|09|10|11|12)\/[0-9]{2}$/;
        const creditCardBillingNameValid = /^[a-zA-Z]+\s[a-zA-Z]+$/;

        /*console.log(emailRegex.test(user.email));
        console.log(usernameRegex.test(user.username));
        console.log(creditCardNumberRegex.test(user.creditCardNumber));
        console.log(creditCardCVVValid.test(user.creditCardCVV));
        console.log(creditCardExpirationValid.test(user.creditCardExpiration));
        console.log(creditCardBillingNameValid.test(user.creditCardBillingName));*/

        return emailRegex.test(user.email) && usernameRegex.test(user.username) && creditCardNumberRegex.test(user.creditCardNumber) && creditCardCVVValid.test(user.creditCardCVV) && creditCardExpirationValid.test(user.creditCardExpiration) && creditCardBillingNameValid.test(user.creditCardBillingName);
    }

    /**
     * Stores a new user in the DB.
     * Returns true if the operation succeeded.
     *
     * @param user
     */
    public static async registerNewUser(user: IUser): Promise<boolean> {
        const connection = await DBAccess.getConnection();

        const [result]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
            "INSERT INTO users VALUES (default, ?, ?, ?, ?, ?, ?, ?)",
            [user.username, user.email, user.password, user.creditCardNumber, user.creditCardCVV, user.creditCardExpiration.replace("/", ""), user.creditCardBillingName]);

        connection.release();

        const json: any = result;

        return json.affectedRows == 1;
    }
}