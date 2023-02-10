import { use, expect, request } from "chai";
import chaiHttp = require("chai-http");
import { createSandbox, SinonStub } from "sinon";
import sinonChai = require("sinon-chai");
import app from "../../src/app";
import { beforeEach } from "mocha";
import {Booking, DateIntervalPerSocket} from "../../src/model/Booking";
import Authentication from "../../src/helper/authentication";
import {CPMS, ICPMS} from "../../src/model/CPMS";
import axios from "axios";
import { DBAccess } from "../../src/DBAccess";
import CPMSAuthentication from "../../src/helper/CPMSAuthentication";

use(chaiHttp);
use(sinonChai);

const sandbox = createSandbox();

describe("Booking model class", () => {

    let axiosPostStub: SinonStub;
    let DBStub: SinonStub;

    beforeEach(() => {
        axiosPostStub = sandbox.stub(axios, "post");
        DBStub = sandbox.stub(DBAccess, "getConnection");
    });

    afterEach(() => {
        sandbox.restore();
    });

    it("should fail when the DB throws an exception", async () => {
        DBStub.throws("Failed");
        const res = await Booking.cleanupAndBillFines();
        expect(res).to.be.false;
    });

    it("should report no deletions if the DB did not find any expired bookings", async () => {
        DBStub.resolves(new Test1());
        const res = await Booking.cleanupAndBillFines();
        expect(res).to.be.false;
    });

    it("should fail if a deletion was reported but the notification DB fails", async () => {
        DBStub.resolves(new Test2());
        axiosPostStub.resolves({ status: 200, data: { data: {} } });
        const res = await Booking.cleanupAndBillFines();
        expect(res).to.be.false;
    });

    it("should fail if a deletion was reported but the notification DB fails", async () => {
        DBStub.resolves(new Test2());
        axiosPostStub.resolves({ status: 200, data: { data: {} } });
        const res = await Booking.cleanupAndBillFines();
        expect(res).to.be.false;
    });

    it("should succeed if everything succeeds", async () => {
        DBStub.resolves(new Test3());
        axiosPostStub.resolves({ status: 200, data: { data: {} } });
        const res = await Booking.cleanupAndBillFines();
        expect(res).to.be.true;
    });

    it("should return empty bookings if the query returns empty", async function () {
        DBStub.resolves(new Test4([]));
        const res = await Booking.findByUser(1);
        expect(res).to.be.eql([]);
    });

    it("should convert the correct bookings", async function () {
        DBStub.resolves(new Test4([{
            id: 1,
            userId: 1,
            startDate: 0,
            endDate: 500000000,
            isActive: false,
            cpmsId: 1,
            csId: 1,
            socketId: 1
        }]));
        const res = await Booking.findByUser(1);
        expect(res).to.be.eql([new Booking(1, 1, 0, 500000000, false, 1, 1, 1)]);
    });

    it("should return empty slots if the query returns empty", async function () {
        DBStub.resolves(new Test5([]));
        const res = await Booking.getAvailableTimeSlots(1, 1, 1, new Date(), new Date());
        expect(res).to.be.eql([]);
    });

    it("should convert the correct time slots", async function () {
        DBStub.resolves(new Test5([{
            cpms: 1,
            cs: 1,
            socket: 1,
            start: 0,
            end: 3*3600*1000
        }]));
        const res = await Booking.getAvailableTimeSlots(1, 1, 1, new Date(0), new Date(3*3600*1000));
        expect(res).to.be.eql([new DateIntervalPerSocket(new Date(0), new Date(3*3600*1000))]);
    });
});

class Test1 {
    public async execute(sql: string, values: any) : Promise<[any[], any[]]> {
        if(sql == "SELECT DISTINCT u.*, count(*) as bookingsCount FROM users as u JOIN bookings as b on u.id = b.userId WHERE (b.endDate + 600000) < UNIX_TIMESTAMP() * 1000 GROUP BY u.id")
            return [[], []];
        if(sql == "DELETE FROM bookings WHERE (endDate + 600000) < UNIX_TIMESTAMP() * 1000")
            return [({ affectedRows: 0 } as unknown as any[]), []];
        return [[], []];
    }

    public release() {
        return;
    }

    public async beginTransaction() {
        return;
    }

    public async commit() {
        return;
    }
}

class Test2 {
    public async execute(sql: string, values: any) : Promise<[any[], any[]]> {
        if(sql == "SELECT DISTINCT u.*, count(*) as bookingsCount FROM users as u JOIN bookings as b on u.id = b.userId WHERE (b.endDate + 600000) < UNIX_TIMESTAMP() * 1000 GROUP BY u.id")
            return [[{id: 4,
                userName: "MarioLuigi",
                email: "mario.luigi@mushroom.kingdom",
                password: "$2b$04$u3hLguczAiaeVgyAQ6Hpp.Qr/.10SathCJn/SwG2GKWpdOeUZ9f.G",
                paymentCardNumber: "4365875436666669",
                paymentCardCVV: "123",
                paymentCardExpirationDate: "1122",
                paymentCardOwnerName: "MARIO LUIGI",
                bookingsCount: 1
            }], []];
        if(sql == "DELETE FROM bookings WHERE (endDate + 600000) < UNIX_TIMESTAMP() * 1000")
            return [({ affectedRows: 1 } as unknown as any[]), []];
        if(sql == "INSERT INTO notifications VALUES (default, ?, ?, UNIX_TIMESTAMP() * 1000)")
            throw "Notification DB error!";
        return [[], []];
    }

    public release() {
        return;
    }

    public async beginTransaction() {
        return;
    }

    public async commit() {
        return;
    }
}

class Test3 {
    public async execute(sql: string, values: any) : Promise<[any[], any[]]> {
        if(sql == "SELECT DISTINCT u.*, count(*) as bookingsCount FROM users as u JOIN bookings as b on u.id = b.userId WHERE (b.endDate + 600000) < UNIX_TIMESTAMP() * 1000 GROUP BY u.id")
            return [[{id: 4,
                userName: "MarioLuigi",
                email: "mario.luigi@mushroom.kingdom",
                password: "$2b$04$u3hLguczAiaeVgyAQ6Hpp.Qr/.10SathCJn/SwG2GKWpdOeUZ9f.G",
                paymentCardNumber: "4365875436666669",
                paymentCardCVV: "123",
                paymentCardExpirationDate: "1122",
                paymentCardOwnerName: "MARIO LUIGI",
                bookingsCount: 1
            }], []];
        if(sql == "DELETE FROM bookings WHERE (endDate + 600000) < UNIX_TIMESTAMP() * 1000")
            return [({ affectedRows: 1 } as unknown as any[]), []];
        if(sql == "INSERT INTO notifications VALUES (default, ?, ?, UNIX_TIMESTAMP() * 1000)")
            return [({ affectedRows: 1 } as unknown as any[]), []];
        return [[], []];
    }

    public release() {
        return;
    }

    public async beginTransaction() {
        return;
    }

    public async commit() {
        return;
    }
}

class Test4 {

    private result: any[] = []

    constructor(result: any[]) {
        this.result = result;
    }

    public async execute(sql: string, values: any) : Promise<[any[], any[]]> {
        if(sql == "SELECT * FROM bookings WHERE userId = ? AND (startDate >= UNIX_TIMESTAMP() * 1000 OR endDate >= UNIX_TIMESTAMP() * 1000) ORDER BY startDate")
            return [this.result, []];
        return [[], []];
    }

    public release() {
        return;
    }

    public async beginTransaction() {
        return;
    }

    public async commit() {
        return;
    }
}

class Test5 {

    private result: any[] = []

    constructor(result: any[]) {
        this.result = result;
    }

    public async execute(sql: string, values: any) : Promise<[any[], any[]]> {
        if(sql == "SELECT start, end FROM availabilityautomanaged WHERE cpms = ? AND cs = ? AND socket = ? AND ((end >= ? AND end <= ?) OR (start >= ? AND start <= ?)) UNION (SELECT ?, ? WHERE NOT EXISTS (SELECT * FROM bookings WHERE cpmsId = ? AND csId = ? AND socketId = ?))")
            return [this.result, []];
        return [[], []];
    }

    public release() {
        return;
    }

    public async beginTransaction() {
        return;
    }

    public async commit() {
        return;
    }
}