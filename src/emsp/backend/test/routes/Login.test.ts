import { use, expect, request } from "chai";
import chaiHttp = require("chai-http");
import { createSandbox, SinonStub } from "sinon";
import sinonChai = require("sinon-chai");
import app from "../../src/app";
import { User } from "../../src/model/User";
import bcrypt = require( "bcrypt");
import Authentication from "../../src/helper/authentication";
import { beforeEach } from "mocha";
import { DBAccess } from "../../src/DBAccess";

use(chaiHttp);
use(sinonChai);

const sandbox = createSandbox();

describe("/login", () => {

    let requester: ChaiHttp.Agent;
    //let queryUserStub: SinonStub;
    let compareSyncStub: SinonStub;
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
        compareSyncStub = sandbox.stub(bcrypt, "compareSync");
        setAuthenticationCookieStub = sandbox.stub(Authentication, "setAuthenticationCookie");
        DBStub = sandbox.stub(DBAccess, "getConnection");
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe("POST /", () => {

        it("should fail when either the username or password are undefined", async () => {
            const resNoUser = await requester.post("/login").send({
                password: "somePassword"
            });
            const resNoPw = await requester.post("/login").send({
                username: "someUsername",
            });
            expect(resNoUser).to.have.status(400);
            expect(resNoPw).to.have.status(400);
        });

        it("should fail when the query produces no result", async () => {
            DBStub.resolves(new Test1());
            //queryUserStub.resolves(null);
            const res = await requester.post("/login").send({
                username: "someUsername",
                password: "somePassword"
            });
            expect(res).to.have.status(400);
        });

        // NOT WORKING
        // Bypass compareSync stub
        it("should fail if the password is not correct", async () => {
            DBStub.resolves(new Test2());
            //queryUserStub.resolves("username");
            compareSyncStub.returns(false);
            setAuthenticationCookieStub.returns(true);
            const res = await requester.post("/login").send({
                username: "someUsername",
                password: "somePassword"
            });
            expect(res).to.have.status(400);
        });

        it("should fail if the eMSP Authentication cookie is not properly set", async () => {
            //queryUserStub.resolves("username");
            DBStub.resolves(new Test2());
            compareSyncStub.returns(true);
            setAuthenticationCookieStub.returns(false);
            const res = await requester.post("/login").send({
                username: "someUsername",
                password: "somePassword"
            });
            expect(res).to.have.status(500);
        });

        it("should succeed if the credentials are correct", async () => {
            DBStub.resolves(new Test2());
            //queryUserStub.resolves("username");
            compareSyncStub.returns(true);
            setAuthenticationCookieStub.returns(true);
            const credentials = { "username": "someUsername", "email": "test@test.it" };
            const expectedBody = { "data": credentials, "message": "", "status": true };

            const res = await requester.post("/login").send({
                username: "someUsername",
                password: "somePassword"
            });
            expect(res).to.have.status(200);
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
            creditCardBillingName: "test",
            creditCardCVV: 123,
            creditCardExpiration: "1265",
            creditCardNumber: "1231123112311231",
            email: "test@test.it",
            password: "hashsaltedhashsaltedhash",
            username: "someUsername"
        }], []];
    }

    public release() {
        return;
    }
}