import { expect, request, use } from "chai";
import { createSandbox, SinonStub } from "sinon";
import app from "../../src/app";
import { beforeEach } from "mocha";
import axios from "axios";
import Authentication from "../../src/helper/authentication";
import CSConnection, { ChargeSpeedPower, CSDB, SocketMachine, SocketType } from "../../src/model/CSConnection";
import chaiHttp = require("chai-http");
import sinonChai = require("sinon-chai");

use(chaiHttp);
use(sinonChai);

const sandbox = createSandbox();

describe("/recharge-manager endpoint", () => {

    let axiosGetStub: SinonStub;
    let requester: ChaiHttp.Agent;
    let checkJWTStub: SinonStub;
    let socketsStub: SinonStub;
    let startChargeStub: SinonStub;
    let stopChargeStub: SinonStub;
    let getConnectionStub: SinonStub;
    let axiosPostStub: SinonStub;

    before(() => {
        requester = request(app.express).keepOpen();
    });

    after(() => {
        requester.close();
    });

    beforeEach(() => {
        axiosGetStub = sandbox.stub(axios, "get");
        checkJWTStub = sandbox.stub(Authentication, "checkJWT");
        getConnectionStub = sandbox.stub(CSDB.shared, "getConnectionToCSWithID");
        socketsStub = sandbox.stub(CSConnection.prototype, "getSocket");
        startChargeStub = sandbox.stub(CSConnection.prototype, "startCharge");
        stopChargeStub = sandbox.stub(CSConnection.prototype, "stopCharge");
        axiosPostStub = sandbox.stub(axios, "post");
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe("GET /", () => {

        it("should fail if the parameter is missing", async () => {
            checkJWTStub.returns(
                { mspName: "emsp1" }
            );
            const res = await requester.get("/recharge-manager");
            expect(res).to.have.status(400);
        });

        it("should fail if no connection to the cs can be retrieved", async () => {
            checkJWTStub.returns(
                { mspName: "emsp1" }
            );
            getConnectionStub.returns(null);
            const res = await requester.get("/recharge-manager?" +
                "CSID=1" +
                "&socketID=1");
            expect(res).to.have.status(400);
        });

        it("should fail if no socket is retrieved", async () => {
            checkJWTStub.returns(
                { mspName: "emsp1" }
            );
            const tempObj = {};
            Object.setPrototypeOf(tempObj, CSConnection.prototype);
            getConnectionStub.returns(tempObj);
            socketsStub.resolves(null);
            const res = await requester.get("/recharge-manager?" +
                "CSID=1" +
                "&socketID=1");
            expect(res).to.have.status(400);
        });

        it("should fail if data retrieval from the socket fails", async () => {
            checkJWTStub.returns(
                { mspName: "emsp1" }
            );
            const tempObj = {};
            Object.setPrototypeOf(tempObj, CSConnection.prototype);
            getConnectionStub.returns(tempObj);
            socketsStub.resolves({ data: "I'm not empty" });
            const res = await requester.get("/recharge-manager?" +
                "CSID=1" +
                "&socketID=1");
            expect(res).to.have.status(500);
        });

        it("should succeed if data is collected from the cs", async () => {
            checkJWTStub.returns(
                { mspName: "emsp1" }
            );
            const tempObj = {};
            Object.setPrototypeOf(tempObj, CSConnection.prototype);
            getConnectionStub.returns(tempObj);
            const socket = new SocketMachine(1, 1, SocketType.Type1, ChargeSpeedPower.Slow);
            socket.connectCar();
            socket.chargeCar(1, () => {return;}, 1);
            socketsStub.resolves(socket);
            const res = await requester.get("/recharge-manager?" +
                "CSID=1" +
                "&socketID=1");
            console.log(res.body);
            expect(res).to.have.status(200);
        });
    });

    describe("POST /", () => {

        it("should fail when some fields are missing", async () => {
            checkJWTStub.returns(
                { mspName: "emsp1" }
            );
            const res = await requester.post("/recharge-manager").send({
                stationID: 1,
            });
            expect(res).to.have.status(400);
        });

        it("should fail if no cs connection is retrieved", async () => {
            checkJWTStub.returns(
                { mspName: "emsp1" }
            );
            getConnectionStub.returns(null);
            const res = await requester.post("/recharge-manager").send({
                CSID: 1,
                socketID: 1,
                action: "start",
                maximumTimeoutDate: 1,
                mspId: 1
            });
            expect(res).to.have.status(500);
        });

        it("should fail if the command is invalid", async () => {
            checkJWTStub.returns(
                { mspName: "emsp1" }
            );
            getConnectionStub.returns({ data: "stuff" });
            const res = await requester.post("/recharge-manager").send({
                CSID: 1,
                socketID: 1,
                action: "aaaaa",
                maximumTimeoutDate: 1,
                mspId: 1
            });
            expect(res).to.have.status(500);
        });

        it("should fail if the cs update fails", async () => {
            checkJWTStub.returns(
                { mspName: "emsp1" }
            );
            const tempObj = {};
            Object.setPrototypeOf(tempObj, CSConnection.prototype);
            getConnectionStub.returns(tempObj);
            startChargeStub.throws("Nope!");
            const res = await requester.post("/recharge-manager").send({
                CSID: 1,
                socketID: 1,
                action: "start",
                maximumTimeoutDate: 1,
                mspId: 1
            });
            expect(res).to.have.status(500);
        });

        it("should fail the cs update returns false", async () => {
            checkJWTStub.returns(
                { mspName: "emsp1" }
            );
            const tempObj = {};
            Object.setPrototypeOf(tempObj, CSConnection.prototype);
            getConnectionStub.returns(tempObj);
            startChargeStub.resolves(false);
            const res = await requester.post("/recharge-manager").send({
                CSID: 1,
                socketID: 1,
                action: "start",
                maximumTimeoutDate: 1,
                mspId: 1
            });
            expect(res).to.have.status(500);
        });

        it("should fail if the axios call fails", async () => {
            checkJWTStub.returns(
                { mspName: "emsp1" }
            );
            const tempObj = {};
            Object.setPrototypeOf(tempObj, CSConnection.prototype);
            getConnectionStub.returns(tempObj);
            startChargeStub.resolves(true);
            axiosPostStub.throws({ response: { data: { message: "Nothing " } } });
            const res = await requester.post("/recharge-manager").send({
                CSID: 1,
                socketID: 1,
                action: "start",
                maximumTimeoutDate: 1,
                mspId: 1
            });
            expect(res).to.have.status(500);
        });

        it("should succeed if the axios call returns a 200", async () => {
            checkJWTStub.returns(
                { mspName: "emsp1" }
            );
            const tempObj = {};
            Object.setPrototypeOf(tempObj, CSConnection.prototype);
            getConnectionStub.returns(tempObj);
            startChargeStub.resolves(true);
            axiosPostStub.resolves( { status: 200, data: { data: { nothingHere: null } } } );
            const res = await requester.post("/recharge-manager").send({
                CSID: 1,
                socketID: 1,
                action: "start",
                maximumTimeoutDate: 1,
                mspId: 1
            });
            expect(res).to.have.status(200);
        });
    });
});