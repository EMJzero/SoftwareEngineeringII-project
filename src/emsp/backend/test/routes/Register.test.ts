import { use, expect, request } from "chai";
import chaiHttp = require("chai-http");
import { createSandbox, SinonStub } from "sinon";
import sinonChai = require("sinon-chai");
import app from "../../src/app";
import { User } from "../../src/model/User";
import { beforeEach } from "mocha";
import { DBAccess } from "../../src/DBAccess";
import axios from "axios";

use(chaiHttp);
use(sinonChai);

const sandbox = createSandbox();

describe("/register endpoint", () => {

    let requester: ChaiHttp.Agent;
    //let registerNewUserStub: SinonStub;
    let DBStub: SinonStub;
    let axiosPostStub: SinonStub;

    before(() => {
        requester = request(app.express).keepOpen();
    });

    after(() => {
        requester.close();
    });

    beforeEach(() => {
        //registerNewUserStub = sandbox.stub(User, "registerNewUser");
        DBStub = sandbox.stub(DBAccess, "getConnection");
        axiosPostStub = sandbox.stub(axios, "post");
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe("POST /", () => {

        it("should fail when the password is too short", async () => {
            const res = await requester.post("/register").send({
                username : "someUsername",
                email: "someEmail@gmail.com",
                password: "shorty",
                creditCardNumber: "7598531254886325",
                creditCardCVV: "789",
                creditCardExpiration: "11/28",
                creditCardBillingName: "someOwner NamedOwny"
            });
            expect(res).to.have.status(400);
        });

        it("should fail when some fields are missing fails", async () => {
            const res = await requester.post("/register").send({
                username : "someUsername",
                email: "someEmail@gmail.com",
                password: "This1s4S3CurePaw0d"
            });
            expect(res).to.have.status(400);
        });

        it("should fail when some fields are badly formatted", async () => {
            const res = await requester.post("/register").send({
                username : "someUsername",
                email: "someEmail@gmail.com",
                password: "This1s4S3CurePaw0d",
                creditCardNumber: "16",
                creditCardCVV: "789",
                creditCardExpiration: "1128",
                creditCardBillingName: "someOwner NamedOwny"
            });
            expect(res).to.have.status(400);
        });

        it ("should fail if the axios call fails", async () => {
            DBStub.resolves(new Test1());
            //registerNewUserStub.resolves(false);
            axiosPostStub.resolves( { status: 400, data: { data: {} } } );
            const res = await requester.post("/register").send({
                username : "someUsername",
                email: "someEmail@gmail.com",
                password: "This1s4S3CurePaw0d",
                creditCardNumber: "7598531254886325",
                creditCardCVV: "789",
                creditCardExpiration: "11/28",
                creditCardBillingName: "someOwner NamedOwny"
            });
            expect(res).to.have.status(400);
        });

        it ("should fail if the credit card data is invalid", async () => {
            DBStub.resolves(new Test1());
            //registerNewUserStub.resolves(false);
            axiosPostStub.resolves( { status: 200, data: { data: { nothingHere: null, valid: false } } } );
            const res = await requester.post("/register").send({
                username : "someUsername",
                email: "someEmail@gmail.com",
                password: "This1s4S3CurePaw0d",
                creditCardNumber: "7598531254886325",
                creditCardCVV: "789",
                creditCardExpiration: "11/28",
                creditCardBillingName: "someOwner NamedOwny"
            });
            expect(res).to.have.status(400);
        });

        it ("should fail if the registration of the user in the DB fails", async () => {
            DBStub.resolves(new Test1());
            //registerNewUserStub.resolves(false);
            axiosPostStub.resolves( { status: 200, data: { data: { nothingHere: null, valid: true } } } );
            const res = await requester.post("/register").send({
                username : "someUsername",
                email: "someEmail@gmail.com",
                password: "This1s4S3CurePaw0d",
                creditCardNumber: "7598531254886325",
                creditCardCVV: "789",
                creditCardExpiration: "11/28",
                creditCardBillingName: "someOwner NamedOwny"
            });
            expect(res).to.have.status(500);
        });

        it ("should succeed when all the parameters are well defined", async () => {
            DBStub.resolves(new Test2());
            //registerNewUserStub.resolves(true);
            axiosPostStub.resolves( { status: 200, data: { data: { nothingHere: null, valid: true } } } );
            const res = await requester.post("/register").send({
                username : "someUsername",
                email: "someEmail@gmail.com",
                password: "This1s4S3CurePaw0d",
                creditCardNumber: "7598531254886325",
                creditCardCVV: "789",
                creditCardExpiration: "11/28",
                creditCardBillingName: "someOwner NamedOwny"
            });
            expect(res).to.have.status(200);
        });
    });
});

class Test1 {
    public async execute(sql: string, values: any) : Promise<[any[], any[]]> {
        if(sql == "INSERT INTO users VALUES (default, ?, ?, ?, ?, ?, ?, ?)")
            return [({ affectedRows: 0 } as unknown as any[]), []];
        return [[], []];
    }

    public release() {
        return;
    }
}

class Test2 {
    public async execute(sql: string, values: any) : Promise<[any[], any[]]> {
        if(sql == "INSERT INTO users VALUES (default, ?, ?, ?, ?, ?, ?, ?)")
            return [({ affectedRows: 1 } as unknown as any[]), []];
        return [[], []];
    }

    public release() {
        return;
    }
}