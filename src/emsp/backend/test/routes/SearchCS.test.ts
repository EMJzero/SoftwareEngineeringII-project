import { use, expect, request } from "chai";
import chaiHttp = require("chai-http");
import { createSandbox, SinonStub } from "sinon";
import sinonChai = require("sinon-chai");
import app from "../../src/app";
import { User } from "../../src/model/User";
import { beforeEach } from "mocha";
import axios from "axios";
import Authentication from "../../src/helper/authentication";
import { CPMS } from "../../src/model/CPMS";

use(chaiHttp);
use(sinonChai);

const sandbox = createSandbox();

describe("/search endpoint", () => {

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
        CPMSStub = sandbox.stub(CPMS, "findAll");
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe("GET /", () => {

        it("should fail when some fields are missing fails", async () => {
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            const res = await requester.get("/search?latitude=\"12.255\"");
            expect(res).to.have.status(400);
        });

        it("should fail if the DB access for CPMS fails", async () => {
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            CPMSStub.throws("No CPMSs for you!");
            const res = await requester.get("/search?latitude=\"12.255\"" +
                "&longitude=\"58.626\"");
            expect(res).to.have.status(500);
        });

        it("should fail if the axios call fails", async () => {
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            CPMSStub.resolves([ { name: "testName", id: 1 } ]);
            axiosGetStub.throws("Sorry master, I failed you!");
            const res = await requester.get("/search?latitude=\"12.255\"" +
                "&longitude=\"58.626\"");
            expect(res).to.have.status(500);
        });

        it("should succeed when all the parameters are well defined", async () => {
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            CPMSStub.resolves([ { name: "testName", id: 1 } ]);
            axiosGetStub.resolves({ data: { data: { CSList: [{ name: "testName", id: 1 }] } } });
            const res = await requester.get("/search?latitude=\"12.255\"" +
                "&longitude=\"58.626\"");
            expect(res).to.have.status(200);
        });
    });
});