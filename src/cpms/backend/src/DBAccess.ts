import "mysql2/promise";
import mysql, { Pool, PoolConnection } from "mysql2/promise";
import env from "./helper/env";

export class DBAccess {
    static pool: Pool | null;

    public static async getConnection(): Promise<PoolConnection> {
        if(this.pool == null) {
            this.pool = await mysql.createPool({
                host: env.DB_HOST,
                user: env.DB_USER,
                password: env.DB_PASSWORD,
                database: env.DB_DATABASE,
                waitForConnections: true,
                connectionLimit: 2,
                queueLimit: 0,
                decimalNumbers: true
            });
        }

        return await this.pool.getConnection();
    }

    public static async closePool() {
        if(this.pool != null) {
            await this.pool.end();
            this.pool = null;
        }
    }
}

/*async function getCSList(location: [number, number], locationRange: number, priceRange: [number, number]) {
    const connection = await DBAccess.getConnection();

    const [result, _] = await connection.execute("SELECT * FROM cs WHERE (userPrice >= ? AND userPrice <= ?) AND (locationLatitude >= ? - ? AND locationLatitude <= ? + ?) AND (locationLongitude >= ? - ? AND locationLongitude <= ? + ?)",
        [priceRange[0], priceRange[1], location[0], locationRange, location[0], locationRange, location[1], locationRange, location[1], locationRange]);

    connection.release();

    return result;
}

getCSList([30, 140], 20, [2, 20]).then(
    async (result) => {
        console.log(result);
        await DBAccess.closePool();
    }
);*/