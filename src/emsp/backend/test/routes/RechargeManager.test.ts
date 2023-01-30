import { use, expect, request } from "chai";
import chaiHttp = require("chai-http");
import { createSandbox, SinonStub } from "sinon";
import sinonChai = require("sinon-chai");
import app from "../../src/app";
import { beforeEach } from "mocha";
import { Booking } from "../../src/model/Booking";
import Authentication from "../../src/helper/authentication";
import { CPMS } from "../../src/model/CPMS";
import axios from "axios";
import { DBAccess } from "../../src/DBAccess";

use(chaiHttp);
use(sinonChai);

const sandbox = createSandbox();

describe("/recharge-manager endpoint", () => {

    let requester: ChaiHttp.Agent;
    let checkJWTStub: SinonStub;
    let axiosGetStub: SinonStub;
    //let findActiveByUserStub: SinonStub;
    //let findByUserFilteredStub: SinonStub;
    //let findByUserStub: SinonStub;
    //let findByIdStub: SinonStub;
    //let createBookingStub: SinonStub;
    //let deleteBookingStub: SinonStub;
    //let findCurrentByUserStub: SinonStub;
    let DBStub: SinonStub;

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
        //findCurrentByUserStub = sandbox.stub(Booking, "findCurrentByUser");
        DBStub = sandbox.stub(DBAccess, "getConnection");
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe("GET /", () => {

        it("should fail if no bookings is active", async () => {
            DBStub.resolves(new Test1());
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            //findActiveByUserStub.resolves(null);
            const res = await requester.get("/recharge-manager");
            expect(res).to.have.status(400);
        });

        it("should fail if findActiveByUser access fails", async () => {
            DBStub.throws("My aPOWlogies my lord...");
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            //findActiveByUserStub.throws("No DB for you!");
            const res = await requester.get("/recharge-manager");
            expect(res).to.have.status(500);
        });

        it("should fail if findById access fails", async () => {
            DBStub.resolves(new Test2());
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            //findActiveByUserStub.resolves({ csId: 1, socketId: 1 });
            //findByIdStub.throws("No DB for you!");
            const res = await requester.get("/recharge-manager");
            expect(res).to.have.status(500);
        });

        it("should fail if the axios call fails", async () => {
            DBStub.resolves(new Test3());
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            //findActiveByUserStub.resolves({ csId: 1, socketId: 1 });
            //findByIdStub.resolves({ endpoint: "SaySomethingFunny" });
            axiosGetStub.resolves( { status: 400 } );
            const res = await requester.get("/recharge-manager");
            expect(res).to.have.status(400);
        });

        it("should succeed when a valid combination of parameters is given are well defined", async () => {
            DBStub.resolves(new Test3());
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            //findActiveByUserStub.resolves({ csId: 1, socketId: 1 });
            //findByIdStub.resolves({ endpoint: "SaySomethingFunny" });
            axiosGetStub.resolves( { status: 200, data: { data: {
                state: 1,
                currentPower: 1,
                maxPower: 1,
                connectedCar: 1,
                estimatedTimeRemaining: 1
            } } } );
            const res = await requester.get("/recharge-manager");
            expect(res).to.have.status(200);
        });
    });

    describe("POST /", () => {

        it("should fail when some fields are missing", async () => {
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            const res = await requester.post("/recharge-manager").send({
                bookingId: 1,
            });
            expect(res).to.have.status(400);
        });

        it("should fail if the DB access for the booking fails", async () => {
            DBStub.throws("No DB for you!");
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            //findCurrentByUserStub.throws("No DB for you!");
            const res = await requester.post("/recharge-manager").send({
                bookingId: 1,
                action: "start",
            });
            expect(res).to.have.status(500);
        });

        it("should fail if the booking ids do not coincide", async () => {
            DBStub.resolves(new Test1());
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            //findCurrentByUserStub.resolves( { id: 8 } );
            const res = await requester.post("/recharge-manager").send({
                bookingId: 1,
                action: "start",
            });
            expect(res).to.have.status(400);
        });

        it("should fail if the DB access for the CPMS fails", async () => {
            DBStub.resolves(new Test2());
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            //findCurrentByUserStub.resolves( { id: 1 } );
            //findByIdStub.throws("No DB still...");
            const res = await requester.post("/recharge-manager").send({
                bookingId: 1,
                action: "start",
            });
            expect(res).to.have.status(500);
        });

        it("should fail if the axios call fails", async () => {
            DBStub.resolves(new Test3());
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            //findCurrentByUserStub.resolves( { id: 1 } );
            //findByIdStub.resolves( { endpoint: "ThisIsAnEndpoint_Yes?" } );
            axiosGetStub.throws("R.I.P.");
            const res = await requester.post("/recharge-manager").send({
                bookingId: 1,
                action: "start",
            });
            expect(res).to.have.status(500);
        });

        it("should fail if the axios response is not a 200", async () => {
            DBStub.resolves(new Test3());
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            //findCurrentByUserStub.resolves( { id: 1 } );
            //findByIdStub.resolves( { endpoint: "ThisIsAnEndpoint_Yes?" } );
            axiosGetStub.resolves( { status: 400, data: { data: {} } } );
            const res = await requester.post("/recharge-manager").send({
                bookingId: 1,
                action: "start",
            });
            expect(res).to.have.status(400);
        });

        it("should fail if the booking update or delete fails", async () => {
            DBStub.resolves(new Test4());
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            //findCurrentByUserStub.resolves( { id: 1 } );
            //findByIdStub.resolves( { endpoint: "ThisIsAnEndpoint_Yes?" } );
            axiosGetStub.resolves( { status: 200, data: { data: { nothingHere: null } } } );
            const res = await requester.post("/recharge-manager").send({
                bookingId: 1,
                action: "start",
            });
            expect(res).to.have.status(500);
        });

        it("should succeed if the axios call returns a 200", async () => {
            DBStub.resolves(new Test3());
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            //findCurrentByUserStub.resolves( { id: 1 } );
            //findByIdStub.resolves( { endpoint: "ThisIsAnEndpoint_Yes?" } );
            axiosGetStub.resolves( { status: 200, data: { data: { nothingHere: null } } } );
            const res = await requester.post("/recharge-manager").send({
                bookingId: 1,
                action: "start",
            });
            expect(res).to.have.status(200);
        });
    });
});

class Test1 {
    public async execute(sql: string, values: any) : Promise<[any[], any[]]> {
        if(sql == "SELECT * FROM bookings WHERE userId = ? AND isActive")
            return [[], []];
        if(sql == "SELECT * FROM bookings WHERE startDate <= curdate() AND endDate > curdate() AND userId = ?")
            return [[], []];
        return [[], []];
    }

    public release() {
        return;
    }
}

class Test2 {
    public async execute(sql: string, values: any) : Promise<[any[], any[]]> {
        if(sql == "SELECT * FROM bookings WHERE userId = ? AND isActive")
            return [[{ id: 1,
                userId: 1,
                startDate: 10000000,
                endDate: 17000000,
                isActive: 1,
                cpmsId: 1,
                csId: 1,
                socketId: 1 }], []];
        if(sql == "SELECT * FROM bookings WHERE startDate <= curdate() AND endDate > curdate() AND userId = ?")
            return [[{ id: 1,
                userId: 1,
                startDate: 10000000,
                endDate: 17000000,
                isActive: 1,
                cpmsId: 1,
                csId: 1,
                socketId: 1 }], []];
        if(sql == "SELECT * FROM cpmses WHERE id = ?")
            throw "An error";
        return [[], []];
    }

    public release() {
        return;
    }
}

class Test3 {
    public async execute(sql: string, values: any) : Promise<[any[], any[]]> {
        if(sql == "SELECT * FROM bookings WHERE userId = ? AND isActive")
            return [[{ id: 1,
                userId: 1,
                startDate: 10000000,
                endDate: 17000000,
                isActive: 1,
                cpmsId: 1,
                csId: 1,
                socketId: 1 }], []];
        if(sql == "SELECT * FROM bookings WHERE startDate <= curdate() AND endDate > curdate() AND userId = ?")
            return [[{ id: 1,
                userId: 1,
                startDate: 10000000,
                endDate: 17000000,
                isActive: 1,
                cpmsId: 1,
                csId: 1,
                socketId: 1 }], []];
        if(sql == "SELECT * FROM cpmses WHERE id = ?")
            return [[{ start: 123, end: 10000000, socketId: 1 }], []];
        if(sql == "UPDATE bookings SET isActive = true WHERE userId = ? AND id = ?" ||
            sql == "DELETE FROM bookings WHERE userId = ? AND id = ?")
            return [({ affectedRows: 1 } as unknown as any[]), []];
        return [[], []];
    }

    public release() {
        return;
    }
}

class Test4 {
    public async execute(sql: string, values: any) : Promise<[any[], any[]]> {
        if(sql == "SELECT * FROM bookings WHERE userId = ? AND isActive")
            return [[{ id: 1,
                userId: 1,
                startDate: 10000000,
                endDate: 17000000,
                isActive: 1,
                cpmsId: 1,
                csId: 1,
                socketId: 1 }], []];
        if(sql == "SELECT * FROM bookings WHERE startDate <= curdate() AND endDate > curdate() AND userId = ?")
            return [[{ id: 1,
                userId: 1,
                startDate: 10000000,
                endDate: 17000000,
                isActive: 1,
                cpmsId: 1,
                csId: 1,
                socketId: 1 }], []];
        if(sql == "SELECT * FROM cpmses WHERE id = ?")
            return [[{ start: 123, end: 10000000, socketId: 1 }], []];
        if(sql == "UPDATE bookings SET isActive = true WHERE userId = ? AND id = ?" ||
            sql == "DELETE FROM bookings WHERE userId = ? AND id = ?")
            return [({ affectedRows: 0 } as unknown as any[]), []];
        return [[], []];
    }

    public release() {
        return;
    }
}