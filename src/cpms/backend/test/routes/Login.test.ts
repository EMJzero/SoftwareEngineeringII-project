import { use, expect, request } from "chai";
import chaiHttp = require("chai-http");
import { createSandbox, SinonStub } from "sinon";
import sinonChai = require("sinon-chai");
import app from "../../src/app";
import { Emsp } from "../../src/model/Emsp";
import Authentication from "../../src/helper/authentication";
import { beforeEach } from "mocha";
import { DBAccess } from "../../src/DBAccess";

use(chaiHttp);
use(sinonChai);

const sandbox = createSandbox();

describe("/login-emsp", () => {

    let requester: ChaiHttp.Agent;
    //let queryUserStub: SinonStub;
    let setAuthenticationCookieStub: SinonStub;
    let DBStub: SinonStub;

    before(() => {
        requester = request(app.express).keepOpen();
    });

    after(() => {
        requester.close();
    });

    beforeEach(() => {
        //queryUserStub = sandbox.stub(User, "findByUsername");
        setAuthenticationCookieStub = sandbox.stub(Authentication, "setAuthenticationCookie");
        DBStub = sandbox.stub(DBAccess, "getConnection");
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe("POST /", () => {

        it("should fail when either the name or key are undefined", async () => {
            const resNoUser = await requester.post("/login-emsp").send({
                apiKey: "keykey"
            });
            const resNoPw = await requester.post("/login-emsp").send({
                mspName: "notAName"
            });
            expect(resNoUser).to.have.status(400);
            expect(resNoPw).to.have.status(400);
        });

        it("should fail when the query produces no result", async () => {
            DBStub.resolves(new Test1());
            //queryUserStub.resolves(null);
            const res = await requester.post("/login").send({
                apiKey: "keykey",
                mspName: "notAName"
            });
            expect(res).to.have.status(400);
        });

        it("should fail if the authentication cookie is not properly set", async () => {
            //queryUserStub.resolves("username");
            DBStub.resolves(new Test2());
            setAuthenticationCookieStub.returns(false);
            const res = await requester.post("/login").send({
                apiKey: "keykey",
                mspName: "notAName"
            });
            expect(res).to.have.status(500);
        });

        it("should succeed if the credentials are correct", async () => {
            DBStub.resolves(new Test2());
            //queryUserStub.resolves("username");
            setAuthenticationCookieStub.returns(true);
            const credentials = { "apiKey": "keykey", "mspName": "notAName" };
            const expectedBody = { "data": credentials, "message": "", "status": true };

            const res = await requester.post("/login").send({
                apiKey: "keykey",
                mspName: "notAName"
            });
            expect(res).to.have.status(200);
            console.log(res.body);
            expect(res.body).to.be.eql(expectedBody);
        });
    });
});

class Test1 {
    public async execute(sql: string, values: any) : Promise<[any[], any[]]> {
        return [[], []];
    }

    public release() {
        return;
    }
}

class Test2 {
    public async execute(sql: string, values: any) : Promise<[any[], any[]]> {
        return [[{
            id: 1,
        }], []];
    }

    public release() {
        return;
    }
}