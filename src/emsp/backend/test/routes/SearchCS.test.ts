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
import { DBAccess } from "../../src/DBAccess";
import CPMSAuthentication from "../../src/helper/CPMSAuthentication";

use(chaiHttp);
use(sinonChai);

const sandbox = createSandbox();

describe("/search endpoint", () => {

    let requester: ChaiHttp.Agent;
    let axiosGetStub: SinonStub;
    let checkJWTStub: SinonStub;
    //let CPMSStub: SinonStub;
    let DBStub: SinonStub;
    let CPMSAuthenticationStub: SinonStub;

    before(() => {
        requester = request(app.express).keepOpen();
    });

    after(() => {
        requester.close();
    });

    beforeEach(() => {
        axiosGetStub = sandbox.stub(axios, "get");
        checkJWTStub = sandbox.stub(Authentication, "checkJWT");
        //CPMSStub = sandbox.stub(CPMS, "findAll");
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
            const res = await requester.get("/search?latitude=\"12.255\"");
            expect(res).to.have.status(400);
        });

        it("should fail if the DB access for CPMS fails", async () => {
            DBStub.throws("Sorry, I am not good at my job :(");
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            //CPMSStub.throws("No CPMSs for you!");
            const res = await requester.get("/search?latitude=\"12.255\"" +
                "&longitude=\"58.626\"");
            expect(res).to.have.status(500);
        });

        it("should fail if the axios call fails", async () => {
            DBStub.resolves(new Test1());
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            //CPMSStub.resolves([ { name: "testName", id: 1 } ]);
            CPMSAuthenticationStub.resolves({ id: 123, name: "CPMS1", APIendpoint: "http://test.com", APIkey: "nothing" });
            axiosGetStub.throws({ response: { data: { message: "Nothing " } } });
            const res = await requester.get("/search?latitude=\"12.255\"" +
                "&longitude=\"58.626\"");
            expect(res).to.have.status(500);
        });

        it("should succeed when all the parameters are well defined", async () => {
            DBStub.resolves(new Test1());
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            //CPMSStub.resolves([ { name: "testName", id: 1 } ]);
            CPMSAuthenticationStub.resolves({ id: 123, name: "CPMS1", APIendpoint: "http://test.com", APIkey: "nothing" });
            axiosGetStub.resolves({ data: { data: { CSList: [{ name: "testName", id: 1 }] } } });
            const res = await requester.get("/search?latitude=\"12.255\"" +
                "&longitude=\"58.626\"");
            expect(res).to.have.status(200);
        });
    });
});

class Test1 {
    public async execute(sql: string, values: any) : Promise<[any[], any[]]> {
        if(sql == "SELECT * FROM cpmses")
            return [[{ start: 123, end: 10000000, socketId: 1 }], []];
        return [[], []];
    }

    public release() {
        return;
    }
}