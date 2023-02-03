import { use, expect, request } from "chai";
import chaiHttp = require("chai-http");
import { createSandbox, SinonStub } from "sinon";
import sinonChai = require("sinon-chai");
import app from "../../src/app";
import { beforeEach } from "mocha";
import { Booking } from "../../src/model/Booking";
import Authentication from "../../src/helper/authentication";
import {CPMS, ICPMS} from "../../src/model/CPMS";
import axios from "axios";
import { DBAccess } from "../../src/DBAccess";
import CPMSAuthentication from "../../src/helper/CPMSAuthentication";

use(chaiHttp);
use(sinonChai);

const sandbox = createSandbox();

describe("/cs-notification endpoint", () => {

    let requester: ChaiHttp.Agent;
    let checkJWTStub: SinonStub;
    let axiosGetStub: SinonStub;
    //let findActiveByUserStub: SinonStub;
    //let findByUserFilteredStub: SinonStub;
    //let findByUserStub: SinonStub;
    //let findByIdStub: SinonStub;
    //let createBookingStub: SinonStub;
    //let deleteBookingStub: SinonStub;
    let DBStub: SinonStub;
    let CPMSAuthenticationStub: SinonStub;

    before(() => {
        requester = request(app.express).keepOpen();
    });

    after(() => {
        requester.close();
    });

    beforeEach(() => {
        checkJWTStub = sandbox.stub(Authentication, "checkJWT");
        axiosGetStub = sandbox.stub(axios, "get");
        //findActiveByUserStub = sandbox.stub(Booking, "findActiveByUser");
        //findByUserFilteredStub = sandbox.stub(Booking, "findByUserFiltered");
        //findByUserStub = sandbox.stub(Booking, "findByUser");
        //findByIdStub = sandbox.stub(CPMS, "findById");
        //createBookingStub = sandbox.stub(Booking, "createBooking");
        //deleteBookingStub = sandbox.stub(Booking, "deleteBooking");
        DBStub = sandbox.stub(DBAccess, "getConnection");
        CPMSAuthenticationStub = sandbox.stub(CPMSAuthentication, "getTokenIfNeeded");
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe("GET /", () => {

        it("should fail if the DB access fails", async () => {
            DBStub.throws("Error in the DB");
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            const res = await requester.get("/cs-notification");
            expect(res).to.have.status(500);
        });

        it("should succeed when a valid combination of parameters is given are well defined", async () => {
            DBStub.resolves(new Test1());
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            const res = await requester.get("/cs-notification");
            console.log(res.body);
            expect(res).to.have.status(200);
        });
    });

    describe("POST /", () => {

        it("should fail if some parameters are missing", async () => {
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            const res = await requester.post("/cs-notification").send({
                affectedCSId: 1,
                affectedCSName: "A Name",
                totalBillableAmount: 20
            });
            expect(res).to.have.status(400);
        });

        it("should fail if DB access for the CPMS fails", async () => {
            DBStub.throws("No CPMS for you");
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            const res = await requester.post("/cs-notification").send({
                issuerCPMSName : "CPMS1",
                affectedCSId: 1,
                affectedCSName: "A Name",
                affectedSocketId: 1,
                totalBillableAmount: 20
            });
            expect(res).to.have.status(500);
        });

        it("should fail if no CPMS is found", async () => {
            DBStub.resolves(new Test2());
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            const res = await requester.post("/cs-notification").send({
                issuerCPMSName : "CPMS1",
                affectedCSId: 1,
                affectedCSName: "A Name",
                affectedSocketId: 1,
                totalBillableAmount: 20
            });
            expect(res).to.have.status(400);
        });

        it("should succeed even if no user is found", async () => {
            DBStub.resolves(new Test3());
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            const res = await requester.post("/cs-notification").send({
                issuerCPMSName : "CPMS1",
                affectedCSId: 1,
                affectedCSName: "A Name",
                affectedSocketId: 1,
                totalBillableAmount: 20
            });
            expect(res).to.have.status(200);
        });

        it("should succeed if every parametere is correct", async () => {
            DBStub.resolves(new Test1());
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            const res = await requester.post("/cs-notification").send({
                issuerCPMSName : "CPMS1",
                affectedCSId: 1,
                affectedCSName: "A Name",
                affectedSocketId: 1,
                totalBillableAmount: 20
            });
            expect(res).to.have.status(200);
        });
    });

    describe("DELETE /", () => {

        it("should succeed if the bookingId is correct", async () => {
            DBStub.throws("Ops...");
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            const res = await requester.delete("/cs-notification");
            expect(res).to.have.status(500);
        });

        it("should succeed if the bookingId is correct", async () => {
            DBStub.resolves(new Test1());
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            const res = await requester.delete("/cs-notification");
            expect(res).to.have.status(200);
        });
    });
});

class Test1 {
    public async execute(sql: string, values: any) : Promise<[any[], any[]]> {
        if(sql == "SELECT * FROM notifications WHERE userId = ?")
            return [[{ id: 1,
                userId: 1,
                content: "Nothing at all!",
                generationDate: 1000000 }], []];
        if(sql == "SELECT * FROM cpmses WHERE name = ?")
            return [[{ id: 123, name: "CPMS1", APIendpoint: "http://test.com", APIkey: "nothing" }], []];
        if(sql == "SELECT u.*, b.id as bookingID FROM bookings as b JOIN users u on b.userId = u.id WHERE b.cpmsId = ? AND b.csId = ? AND b.socketId = ? AND isActive")
            return [[{
                id: 1,
                creditCardBillingName: "test",
                creditCardCVV: 123,
                creditCardExpiration: "1265",
                creditCardNumber: "1231123112311231",
                email: "test@test.it",
                password: "hashsaltedhashsaltedhash",
                username: "someUsername"
            }], []];
        if(sql == "INSERT INTO notifications VALUES (default, ?, ?, UNIX_TIMESTAMP() * 1000)")
            return [({ affectedRows: 1 } as unknown as any[]), []];
        if(sql == "DELETE FROM bookings WHERE userId = ? AND id = ?")
            return [({ affectedRows: 1 } as unknown as any[]), []];
        if(sql == "DELETE FROM notifications WHERE userId = ?")
            return [[], []];
        return [[], []];
    }

    public release() {
        return;
    }
}

class Test2 {
    public async execute(sql: string, values: any) : Promise<[any[], any[]]> {
        if(sql == "SELECT * FROM notifications WHERE userId = ?")
            return [[{ id: 1,
                userId: 1,
                content: "Nothing at all!",
                generationDate: 1000000 }], []];
        if(sql == "SELECT * FROM cpmses WHERE name = ?")
            return [[], []];
        if(sql == "SELECT u.*, b.id as bookingID FROM bookings as b JOIN users u on b.userId = u.id WHERE b.cpmsId = ? AND b.csId = ? AND b.socketId = ? AND isActive")
            return [[], []];
        return [[], []];
    }

    public release() {
        return;
    }
}

class Test3 {
    public async execute(sql: string, values: any) : Promise<[any[], any[]]> {
        if(sql == "SELECT * FROM notifications WHERE userId = ?")
            return [[{ id: 1,
                userId: 1,
                content: "Nothing at all!",
                generationDate: 1000000 }], []];
        if(sql == "SELECT * FROM cpmses WHERE name = ?")
            return [[{ id: 123, name: "CPMS1", APIendpoint: "http://test.com", APIkey: "nothing" }], []];
        if(sql == "SELECT u.*, b.id as bookingID FROM bookings as b JOIN users u on b.userId = u.id WHERE b.cpmsId = ? AND b.csId = ? AND b.socketId = ? AND isActive")
            return [[], []];
        return [[], []];
    }

    public release() {
        return;
    }
}