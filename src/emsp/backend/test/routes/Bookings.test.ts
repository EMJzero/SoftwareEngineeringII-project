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

describe("/bookings endpoint", () => {

    let requester: ChaiHttp.Agent;
    let checkJWTStub: SinonStub;
    let axiosGetStub: SinonStub;
    let findActiveByUserStub: SinonStub;
    let findByUserFilteredStub: SinonStub;
    let findByUserStub: SinonStub;
    let findByIdStub: SinonStub;
    let createBookingStub: SinonStub;
    let deleteBookingStub: SinonStub;

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
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            findActiveByUserStub.throws("No DB for you!");
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
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            findByUserFilteredStub.throws("No DB for you!");
            const res = await requester.get("/bookings?referenceDateDay=12" +
                "&referenceDateMonth=6" +
                "&referenceDateYear=2023" +
                "&intervalDays=2");
            expect(res).to.have.status(500);
        });

        it("should fail if findByUser access fails", async () => {
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            findByUserStub.throws("No DB for you!");
            const res = await requester.get("/bookings");
            expect(res).to.have.status(500);
        });

        it("should succeed when a valid combination of parameters is given are well defined", async () => {
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            findByUserStub.resolves("response");
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
                startUnixTime : new Date().valueOf(),
                endUnixTime: new Date().valueOf() + 1000,
                cpmsID: 1,
                csID: 1,
                socketID: 2
            });
            expect(res).to.have.status(400);
        });

        it("should fail when the axios call fails", async () => {
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            findByIdStub.resolves({ endpoint: "endpointPlaceholder" });
            axiosGetStub.throws("Nope :)");
            const res = await requester.post("/bookings").send({
                startUnixTime : new Date().valueOf(),
                endUnixTime: new Date().valueOf() + 2*60*60*1000,
                cpmsID: 1,
                csID: 1,
                socketID: 2
            });
            expect(res).to.have.status(500);
        });

        it("should fail when no CS are found", async () => {
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            findByIdStub.resolves({ endpoint: "endpointPlaceholder" });
            axiosGetStub.resolves({ data: { data: JSON.stringify({}) } } );
            const res = await requester.post("/bookings").send({
                startUnixTime : new Date().valueOf(),
                endUnixTime: new Date().valueOf() + 2*60*60*1000,
                cpmsID: 1,
                csID: 1,
                socketID: 2
            });
            expect(res).to.have.status(400);
        });

        it("should fail if the insertion in the DB fails", async () => {
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            findByIdStub.resolves({ endpoint: "endpointPlaceholder" });
            axiosGetStub.resolves({ data: { data: JSON.stringify({ CSList: "Not Undefined" }) } } );
            createBookingStub.resolves(false);
            const res = await requester.post("/bookings").send({
                startUnixTime : new Date().valueOf(),
                endUnixTime: new Date().valueOf() + 2*60*60*1000,
                cpmsID: 1,
                csID: 1,
                socketID: 2
            });
            expect(res).to.have.status(400);
        });

        it("should succeed if every parametere is correct", async () => {
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            findByIdStub.resolves({ endpoint: "endpointPlaceholder" });
            axiosGetStub.resolves({ data: { data: JSON.stringify({ CSList: "Not Undefined" }) } } );
            createBookingStub.resolves(true);
            const res = await requester.post("/bookings").send({
                startUnixTime : new Date().valueOf(),
                endUnixTime: new Date().valueOf() + 2*60*60*1000,
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
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            deleteBookingStub.resolves(false);
            const res = await requester.delete("/bookings").send({
                bookingId: 1
            });
            expect(res).to.have.status(400);
        });

        it("should succeed if the bookingId is correct", async () => {
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            deleteBookingStub.resolves(true);
            const res = await requester.delete("/bookings").send({
                bookingId: 1
            });
            expect(res).to.have.status(200);
        });

    });
});