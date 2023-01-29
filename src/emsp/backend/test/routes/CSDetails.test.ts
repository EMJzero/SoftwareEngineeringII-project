import { use, expect, request } from "chai";
import chaiHttp = require("chai-http");
import { createSandbox, SinonStub } from "sinon";
import sinonChai = require("sinon-chai");
import app from "../../src/app";
import { beforeEach } from "mocha";
import axios from "axios";
import Authentication from "../../src/helper/authentication";
import { CPMS } from "../../src/model/CPMS";

use(chaiHttp);
use(sinonChai);

const sandbox = createSandbox();

describe("/details endpoint", () => {

    let requester: ChaiHttp.Agent;
    let axiosGetStub: SinonStub;
    let checkJWTStub: SinonStub;
    let CPMSStub: SinonStub;

    before(() => {
        requester = request(app.express).keepOpen();
    });

    after(() => {
        requester.close();
    });

    beforeEach(() => {
        axiosGetStub = sandbox.stub(axios, "get");
        checkJWTStub = sandbox.stub(Authentication, "checkJWT");
        CPMSStub = sandbox.stub(CPMS, "findByName");
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe("GET /", () => {

        it("should fail when some fields are missing fails", async () => {
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            const res = await requester.get("/details?stationID=1");
            expect(res).to.have.status(400);
        });

        it("should fail if the DB access for CPMS fails", async () => {
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            CPMSStub.throws("No CPMS for you!");
            const res = await requester.get("/details?stationID=1" +
                "&cpmsName=\"testName\"");
            expect(res).to.have.status(500);
        });

        it("should fail if the given cpms name is invalid", async () => {
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            CPMSStub.resolves(null);
            const res = await requester.get("/details?stationID=1" +
                "&cpmsName=\"testName\"");
            expect(res).to.have.status(400);
        });

        it("should fail if the axios call fails", async () => {
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            CPMSStub.resolves({ endpoint: "endpointTippityToppy" });
            axiosGetStub.throws("Sorry, I failed MyLord");
            const res = await requester.get("/details?stationID=1" +
                "&cpmsName=\"testName\"");
            expect(res).to.have.status(500);
        });

        it("should fail if the stationID is invalid", async () => {
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            CPMSStub.resolves({ endpoint: "endpointTippityToppy" });
            axiosGetStub.resolves({ data: { data: JSON.stringify({}) } } );
            const res = await requester.get("/details?stationID=1" +
                "&cpmsName=\"testName\"");
            expect(res).to.have.status(400);
        });

        it("should succeed when all the parameters are well defined", async () => {
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            CPMSStub.resolves({ endpoint: "endpointTippityToppy" });
            axiosGetStub.resolves({ data: { data: JSON.stringify({ CSList: "Not Undefined" }) } } );
            const res = await requester.get("/details?stationID=1" +
                "&cpmsName=\"testName\"");
            expect(res).to.have.status(200);
        });
    });
});