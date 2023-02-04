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

describe("/bookings endpoint", () => {

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

        it("should fail when some fields are missing fails", async () => {
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            const res = await requester.get("/bookings?referenceDateDay=12");
            expect(res).to.have.status(400);
        });

        it("should fail if findActiveByUser access fails", async () => {
            DBStub.throws("Ops, this failed...");
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            //findActiveByUserStub.throws("No DB for you!");
            const res = await requester.get("/bookings?retrieveActiveBooking=1");
            expect(res).to.have.status(500);
        });

        it("should fail if a given date is incomplete", async () => {
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            const res = await requester.get("/bookings?referenceDateDay=12");
            expect(res).to.have.status(400);
        });

        it("should fail if findByUserFiltered access fails", async () => {
            DBStub.throws("Nevermind, I'll fail...");
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            //findByUserFilteredStub.throws("No DB for you!");
            const res = await requester.get("/bookings?referenceDateDay=12" +
                "&referenceDateMonth=6" +
                "&referenceDateYear=2023" +
                "&intervalDays=2");
            expect(res).to.have.status(500);
        });

        it("should fail if findByUser access fails", async () => {
            DBStub.throws("Ciao DB, say hallo to the realm of the dead...");
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            //findByUserStub.throws("No DB for you!");
            const res = await requester.get("/bookings");
            expect(res).to.have.status(500);
        });

        it("should succeed when a valid combination of parameters is given are well defined", async () => {
            DBStub.resolves(new Test1());
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            //findByUserStub.resolves("response");
            const res = await requester.get("/bookings?" +
                "referenceDateDay=1" +
                "&referenceDateMonth=1" +
                "&referenceDateYear=2024" +
                "&intervalDays=5");
            expect(res).to.have.status(200);
        });

        it("should succeed when a valid combination of parameters is given are well defined #2", async () => {
            DBStub.resolves(new Test1());
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            //findByUserStub.resolves("response");
            const res = await requester.get("/bookings");
            expect(res).to.have.status(200);
        });
    });

    describe("POST /", () => {

        it("should fail when some fields are missing", async () => {
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            const res = await requester.post("/bookings").send({
                cpmsID: 1,
                csID: 1,
                socketID: 2
            });
            expect(res).to.have.status(400);
        });

        it("should fail when the dates are more than 1 day apart", async () => {
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            const res = await requester.post("/bookings").send({
                startUnixTime : new Date().valueOf(),
                endUnixTime: new Date().valueOf() + 26*60*60*1000,
                cpmsID: 1,
                csID: 1,
                socketID: 2
            });
            expect(res).to.have.status(400);
        });

        it("should fail when the dates too closer together", async () => {
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            const res = await requester.post("/bookings").send({
                startUnixTime : new Date().valueOf()+ 1000000,
                endUnixTime: new Date().valueOf() + 1000001,
                cpmsID: 1,
                csID: 1,
                socketID: 2
            });
            expect(res).to.have.status(400);
        });

        it("should fail when the start date is in the past", async () => {
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            const res = await requester.post("/bookings").send({
                startUnixTime : new Date().valueOf() - 1000,
                endUnixTime: new Date().valueOf() + 1000,
                cpmsID: 1,
                csID: 1,
                socketID: 2
            });
            expect(res).to.have.status(400);
        });

        it("should fail when the start date is after the end date", async () => {
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            const res = await requester.post("/bookings").send({
                startUnixTime : new Date().valueOf() + 30000000,
                endUnixTime: new Date().valueOf() + 10000000,
                cpmsID: 1,
                csID: 1,
                socketID: 2
            });
            expect(res).to.have.status(400);
        });

        it("should fail when the axios call fails", async () => {
            DBStub.resolves(new Test1());
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            DBStub.resolves(new Test1());
            CPMSAuthenticationStub.resolves({ id: 123, name: "CPMS1", APIendpoint: "http://test.com", APIkey: "nothing" });
            //findByIdStub.resolves({ endpoint: "endpointPlaceholder" });
            axiosGetStub.throws({ response: { data: { message: "Nothing " } } });
            const res = await requester.post("/bookings").send({
                startUnixTime : new Date().valueOf() + 10000000,
                endUnixTime: new Date().valueOf() + 10000000 + 2*60*60*1000,
                cpmsID: 1,
                csID: 1,
                socketID: 2
            });
            expect(res).to.have.status(500);
        });

        it("should fail when no CS are found", async () => {
            DBStub.resolves(new Test1());
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            //findByIdStub.resolves({ endpoint: "endpointPlaceholder" });
            CPMSAuthenticationStub.resolves({ id: 123, name: "CPMS1", APIendpoint: "http://test.com", APIkey: "nothing" });
            axiosGetStub.resolves({ data: { data: {} } } );
            const res = await requester.post("/bookings").send({
                startUnixTime : new Date().valueOf() + 10000000,
                endUnixTime: new Date().valueOf() + 10000000 + 2*60*60*1000,
                cpmsID: 1,
                csID: 1,
                socketID: 2
            });
            expect(res).to.have.status(400);
        });

        it("should fail if the insertion in the DB fails", async () => {
            DBStub.resolves(new Test1());
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            //findByIdStub.resolves({ endpoint: "endpointPlaceholder" });
            CPMSAuthenticationStub.resolves({ id: 123, name: "CPMS1", APIendpoint: "http://test.com", APIkey: "nothing" });
            axiosGetStub.resolves({ data: { data: { CSList: "Not Undefined" } } } );
            //createBookingStub.resolves(false);
            const res = await requester.post("/bookings").send({
                startUnixTime : new Date().valueOf() + 10000000,
                endUnixTime: new Date().valueOf() + 10000000 + 2*60*60*1000,
                cpmsID: 1,
                csID: 1,
                socketID: 2
            });
            expect(res).to.have.status(400);
        });

        it("should succeed if every parametere is correct", async () => {
            DBStub.resolves(new Test2());
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            //findByIdStub.resolves({ endpoint: "endpointPlaceholder" });
            axiosGetStub.resolves({ data: { data: { CSList: "Not Undefined" } } } );
            CPMSAuthenticationStub.resolves({ id: 123, name: "CPMS1", APIendpoint: "http://test.com", APIkey: "nothing" });
            //createBookingStub.resolves(true);
            const res = await requester.post("/bookings").send({
                startUnixTime : new Date().valueOf() + 10000000,
                endUnixTime: new Date().valueOf() + 10000000 + 2*60*60*1000,
                cpmsID: 1,
                csID: 1,
                socketID: 2
            });
            expect(res).to.have.status(200);
        });
    });

    describe("DELETE /", () => {

        it("should fail if no bookingId is given", async () => {
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            const res = await requester.delete("/bookings").send({
                nothing: ":)"
            });
            expect(res).to.have.status(400);
        });

        it("should fail if the delete from the DB does not occur due to a bad bookingId", async () => {
            DBStub.resolves(new Test1());
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            //deleteBookingStub.resolves(false);
            const res = await requester.delete("/bookings").send({
                bookingId: 1
            });
            expect(res).to.have.status(400);
        });

        it("should succeed if the bookingId is correct", async () => {
            DBStub.resolves(new Test2());
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            //deleteBookingStub.resolves(true);
            const res = await requester.delete("/bookings").send({
                bookingId: 1
            });
            expect(res).to.have.status(200);
        });

    });
});

class Test1 {
    public async execute(sql: string, values: any) : Promise<[any[], any[]]> {
        if(sql == "SELECT * FROM bookings WHERE userId = ? AND isActive" ||
            sql == "SELECT * FROM bookings WHERE userId = ? AND startDate >= ? AND endDate <= ?" ||
            sql == "SELECT * FROM bookings WHERE userId = ? AND startDate >= curdate()" ||
            sql == "SELECT * FROM bookings WHERE userId = ? AND startDate >= ? AND endDate <= ? ORDER BY startDate")
            return [[{ id: 123,
                userId: 1,
                startDate: 10000000,
                endDate: 17000000,
                isActive: 1,
                cpmsId: 1,
                csId: 1,
                socketId: 1 }], []];
        if(sql == "SELECT * FROM cpmses WHERE id = ?")
            return [[{ id: 123, name: "CPMS1", APIendpoint: "http://test.com", APIkey: "nothing" }], []];
        if(sql == "SELECT id FROM bookings WHERE ((startDate >= ? AND startDate <= ?) OR (endDate >= ? AND startDate <= ?)) AND ((cpmsId = ? AND csId = ? AND socketId = ?) OR (userId = ?))")
            return [[], []];
        if(sql == "INSERT INTO bookings VALUES (default, ?, ?, ?, ?, ?, ?, ?)")
            return [({ affectedRows: 0 } as unknown as any[]), []];
        if(sql == "DELETE FROM bookings WHERE userId = ? AND id = ?")
            return [({ affectedRows: 0 } as unknown as any[]), []];
        return [[], []];
    }

    public release() {
        return;
    }
}

class Test2 {
    public async execute(sql: string, values: any) : Promise<[any[], any[]]> {
        if(sql == "SELECT * FROM bookings WHERE userId = ? AND isActive" ||
            sql == "SELECT * FROM bookings WHERE userId = ? AND startDate >= ? AND endDate <= ?" ||
            sql == "SELECT * FROM bookings WHERE userId = ? AND startDate >= curdate()")
            return [[{ id: 123,
                userId: 1,
                startDate: 10000000,
                endDate: 17000000,
                isActive: 1,
                cpmsId: 1,
                csId: 1,
                socketId: 1 }], []];
        if(sql == "SELECT * FROM cpmses WHERE id = ?")
            return [[{ id: 123, name: "CPMS1", APIendpoint: "http://test.com", APIkey: "nothing" }], []];
        if(sql == "SELECT id FROM bookings WHERE ((startDate >= ? AND startDate <= ?) OR (endDate >= ? AND startDate <= ?)) AND ((cpmsId = ? AND csId = ? AND socketId = ?) OR (userId = ?))")
            return [[], []];
        if(sql == "INSERT INTO bookings VALUES (default, ?, ?, ?, ?, ?, ?, ?)")
            return [({ affectedRows: 1 } as unknown as any[]), []];
        if(sql == "DELETE FROM bookings WHERE userId = ? AND id = ?")
            return [({ affectedRows: 1 } as unknown as any[]), []];
        return [[], []];
    }

    public release() {
        return;
    }
}