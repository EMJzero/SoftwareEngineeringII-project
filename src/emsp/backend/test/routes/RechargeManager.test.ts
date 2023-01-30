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

use(chaiHttp);
use(sinonChai);

const sandbox = createSandbox();

describe("/recharge-manager endpoint", () => {

    let requester: ChaiHttp.Agent;
    let checkJWTStub: SinonStub;
    let axiosGetStub: SinonStub;
    let findActiveByUserStub: SinonStub;
    let findByUserFilteredStub: SinonStub;
    let findByUserStub: SinonStub;
    let findByIdStub: SinonStub;
    let createBookingStub: SinonStub;
    let deleteBookingStub: SinonStub;
    let findCurrentByUserStub: SinonStub;

    before(() => {
        requester = request(app.express).keepOpen();
    });

    after(() => {
        requester.close();
    });

    beforeEach(() => {
        checkJWTStub = sandbox.stub(Authentication, "checkJWT");
        axiosGetStub = sandbox.stub(axios, "get");
        findActiveByUserStub = sandbox.stub(Booking, "findActiveByUser");
        findByUserFilteredStub = sandbox.stub(Booking, "findByUserFiltered");
        findByUserStub = sandbox.stub(Booking, "findByUser");
        findByIdStub = sandbox.stub(CPMS, "findById");
        createBookingStub = sandbox.stub(Booking, "createBooking");
        deleteBookingStub = sandbox.stub(Booking, "deleteBooking");
        findCurrentByUserStub = sandbox.stub(Booking, "findCurrentByUser");
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe("GET /", () => {

        it("should fail if no bookings is active", async () => {
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            findActiveByUserStub.resolves(null);
            const res = await requester.get("/recharge-manager");
            expect(res).to.have.status(400);
        });

        it("should fail if findActiveByUser access fails", async () => {
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            findActiveByUserStub.throws("No DB for you!");
            const res = await requester.get("/recharge-manager");
            expect(res).to.have.status(500);
        });

        it("should fail if findById access fails", async () => {
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            findActiveByUserStub.resolves({ csId: 1, socketId: 1 });
            findByIdStub.throws("No DB for you!");
            const res = await requester.get("/recharge-manager");
            expect(res).to.have.status(500);
        });

        it("should fail if the axios call fails", async () => {
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            findActiveByUserStub.resolves({ csId: 1, socketId: 1 });
            findByIdStub.resolves({ endpoint: "SaySomethingFunny" });
            axiosGetStub.resolves( { status: 400 } );
            const res = await requester.get("/recharge-manager");
            expect(res).to.have.status(400);
        });

        it("should succeed when a valid combination of parameters is given are well defined", async () => {
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            findActiveByUserStub.resolves({ csId: 1, socketId: 1 });
            findByIdStub.resolves({ endpoint: "SaySomethingFunny" });
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
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            findCurrentByUserStub.throws("No DB for you!");
            const res = await requester.post("/recharge-manager").send({
                bookingId: 1,
                action: "start",
            });
            expect(res).to.have.status(500);
        });

        it("should fail if the booking ids do not coincide", async () => {
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            findCurrentByUserStub.resolves( { id: 8 } );
            const res = await requester.post("/recharge-manager").send({
                bookingId: 1,
                action: "start",
            });
            expect(res).to.have.status(400);
        });

        it("should fail if the DB access for the CPMS fails", async () => {
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            findCurrentByUserStub.resolves( { id: 1 } );
            findByIdStub.throws("No DB still...");
            const res = await requester.post("/recharge-manager").send({
                bookingId: 1,
                action: "start",
            });
            expect(res).to.have.status(500);
        });

        it("should fail if the axios call fails", async () => {
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            findCurrentByUserStub.resolves( { id: 1 } );
            findByIdStub.resolves( { endpoint: "ThisIsAnEndpoint_Yes?" } );
            axiosGetStub.throws("R.I.P.");
            const res = await requester.post("/recharge-manager").send({
                bookingId: 1,
                action: "start",
            });
            expect(res).to.have.status(500);
        });

        it("should fail if the axios response is not a 200", async () => {
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            findCurrentByUserStub.resolves( { id: 1 } );
            findByIdStub.resolves( { endpoint: "ThisIsAnEndpoint_Yes?" } );
            axiosGetStub.resolves( { status: 400, data: { data: {} } } );
            const res = await requester.post("/recharge-manager").send({
                bookingId: 1,
                action: "start",
            });
            expect(res).to.have.status(400);
        });

        it("should succeed if the axios call returns a 200", async () => {
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            findCurrentByUserStub.resolves( { id: 1 } );
            findByIdStub.resolves( { endpoint: "ThisIsAnEndpoint_Yes?" } );
            axiosGetStub.resolves( { status: 200, data: { data: { nothingHere: null } } } );
            const res = await requester.post("/recharge-manager").send({
                bookingId: 1,
                action: "start",
            });
            expect(res).to.have.status(200);
        });
    });
});