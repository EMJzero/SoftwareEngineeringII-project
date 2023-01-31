import { use, expect, request } from "chai";
import chaiHttp = require("chai-http");
import { createSandbox, SinonStub } from "sinon";
import sinonChai = require("sinon-chai");
import app from "../../src/app";
import { beforeEach } from "mocha";
import Authentication from "../../src/helper/authentication";
import CSConnection, { CSDB, SocketMachine } from "../../src/model/CSConnection";

use(chaiHttp);
use(sinonChai);

const sandbox = createSandbox();

describe("/cs-manager endpoint", () => {

    let requester: ChaiHttp.Agent;
    let checkJWTStub: SinonStub;
    let socketsStub: SinonStub;
    let startChargeStub: SinonStub;
    let stopChargeStub: SinonStub;
    let getConnectionStub: SinonStub;

    before(() => {
        requester = request(app.express).keepOpen();
    });

    after(() => {
        requester.close();
    });

    beforeEach(() => {
        checkJWTStub = sandbox.stub(Authentication, "checkJWT");
        getConnectionStub = sandbox.stub(CSDB.shared, "getConnectionToCSWithID");
        socketsStub = sandbox.stub(CSConnection.prototype, "sockets");
        startChargeStub = sandbox.stub(CSConnection.prototype, "startCharge");
        stopChargeStub = sandbox.stub(CSConnection.prototype, "stopCharge");
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe("GET /", () => {

        it("should fail if the parameter is missing", async () => {
            checkJWTStub.returns(
                { mspName: "emsp1" }
            );
            const res = await requester.get("/cs-manager");
            expect(res).to.have.status(400);
        });

        it("should fail if no connection to the cs can be retrieved", async () => {
            checkJWTStub.returns(
                { mspName: "emsp1" }
            );
            getConnectionStub.returns(null);
            const res = await requester.get("/cs-manager?" +
                "stationID=1");
            expect(res).to.have.status(400);
        });

        it("should succeed", async () => {
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            const tempObj = {};
            Object.setPrototypeOf(tempObj, CSConnection.prototype);
            getConnectionStub.returns(tempObj);
            socketsStub.resolves({ data: "I'm here!!" });
            const res = await requester.get("/cs-manager?" +
                "stationID=1");
            console.log(res.body);
            expect(res).to.have.status(200);
        });
    });

    describe("POST /", () => {

        it("should fail when some fields are missing", async () => {
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            const res = await requester.post("/cs-manager").send({
                stationID: 1,
                chargeCommand: "start"
            });
            expect(res).to.have.status(400);
        });

        it("should fail if no cs connection is present", async () => {
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            getConnectionStub.returns(null);
            const res = await requester.post("/cs-manager").send({
                stationID: 1,
                socketID: 1,
                chargeCommand: "start"
            });
            expect(res).to.have.status(400);
        });

        it("should fail if the cs status cannot be updated", async () => {
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            const tempObj = {};
            Object.setPrototypeOf(tempObj, CSConnection.prototype);
            getConnectionStub.returns(tempObj);
            startChargeStub.throws("No, I will not start!");
            const res = await requester.post("/cs-manager").send({
                stationID: 1,
                socketID: 1,
                chargeCommand: "start"
            });
            expect(res).to.have.status(500);
        });

        it("should fail if the command is invalid", async () => {
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            const tempObj = {};
            Object.setPrototypeOf(tempObj, CSConnection.prototype);
            getConnectionStub.returns(tempObj);
            const res = await requester.post("/cs-manager").send({
                stationID: 1,
                socketID: 1,
                chargeCommand: "skatush"
            });
            expect(res).to.have.status(400);
        });

        it("should fail if the change's result if false", async () => {
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            const tempObj = {};
            Object.setPrototypeOf(tempObj, CSConnection.prototype);
            getConnectionStub.returns(tempObj);
            startChargeStub.resolves(false);
            const res = await requester.post("/cs-manager").send({
                stationID: 1,
                socketID: 1,
                chargeCommand: "start"
            });
            expect(res).to.have.status(500);
        });

        it("should succeed if everything is fine", async () => {
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            const tempObj = {};
            Object.setPrototypeOf(tempObj, CSConnection.prototype);
            getConnectionStub.returns(tempObj);
            startChargeStub.resolves(true);
            const res = await requester.post("/cs-manager").send({
                stationID: 1,
                socketID: 1,
                chargeCommand: "start"
            });
            expect(res).to.have.status(200);
        });
    });
});