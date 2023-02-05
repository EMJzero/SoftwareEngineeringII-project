import { use, expect, request } from "chai";
import chaiHttp = require("chai-http");
import { createSandbox, SinonStub } from "sinon";
import sinonChai = require("sinon-chai");
import app from "../../src/app";
import { beforeEach } from "mocha";
import {Account} from "../../src/model/Account";
import { DBAccess } from "../../src/DBAccess";

use(chaiHttp);
use(sinonChai);

const sandbox = createSandbox();

describe("/cs-manager endpoint", () => {

    let requester: ChaiHttp.Agent;
    let DBStub: SinonStub;

    before(() => {
        requester = request(app.express).keepOpen();
    });

    after(() => {
        requester.close();
    });

    beforeEach(() => {
        DBStub = sandbox.stub(DBAccess, "getConnection");
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe("POST /", () => {

        it("should fail if all parameters are missing", async () => {
            const res = await requester.post("/accounts");
            expect(res).to.have.status(400);
        });

        it("should fail with invalid command/parameter combination", async () => {
            const res = await requester.post("/accounts").send({
                cardNumber: "1234567890123456",
                cardOwner: "MARIO LUIGI",
                cvv: "123",
                expiration: "1125",
                command: "BILL"
            })
            expect(res).to.have.status(400);
        });

        it("should fail with DB error BILL", async () => {
            DBStub.resolves(new Test1(true));
            const res = await requester.post("/accounts").send({
                cardNumber: "1234567890123456",
                cardOwner: "MARIO LUIGI",
                cvv: "123",
                expiration: "1125",
                billable: 32,
                command: "BILL"
            })
            expect(res).to.have.status(500);
        });

        it("should fail with DB error CHK", async () => {
            DBStub.resolves(new Test2(true));
            const res = await requester.post("/accounts").send({
                cardNumber: "1234567890123456",
                cardOwner: "MARIO LUIGI",
                cvv: "123",
                expiration: "1125",
                command: "CHK"
            })
            expect(res).to.have.status(500);
        });

        it("should succeed with command BILL", async () => {
            DBStub.resolves(new Test1(false));
            const res = await requester.post("/accounts").send({
                cardNumber: "1234567890123456",
                cardOwner: "MARIO LUIGI",
                cvv: "123",
                expiration: "1125",
                billable: 32,
                command: "BILL"
            })
            expect(res).to.have.status(200);
        });

        it("should succeed with command CHK", async () => {
            DBStub.resolves(new Test2(false));
            const res = await requester.post("/accounts").send({
                cardNumber: "1234567890123456",
                cardOwner: "MARIO LUIGI",
                cvv: "123",
                expiration: "1125",
                command: "CHK"
            })
            expect(res).to.have.status(200);
        });
    });
});

class Test1 {

    throws: boolean;

    constructor(throws: boolean) {
        this.throws = throws;
    }

    public async execute(sql: string, values: any) : Promise<[any[], any[]]> {
        if(sql == "UPDATE accounts SET totalBilled = totalBilled + ? WHERE cardNumber = ? and owner = ? and expiration = ? and cvv = ?")
            if (this.throws) {
                throw "ERRRO";
            } else {
                return [[], []];
            }
        if(sql == "SELECT * FROM accounts WHERE cardNumber = ? and owner = ? and expiration = ? and cvv = ?")
            if (this.throws) {
                throw "ERRRO";
            } else {
                return [[], []];
            }
        return [[], []];
    }

    public release() {
        return;
    }
}

class Test2 {

    throws: boolean;

    constructor(throws: boolean) {
        this.throws = throws;
    }

    public async execute(sql: string, values: any) : Promise<[any[], any[]]> {
        if(sql == "UPDATE accounts SET totalBilled = totalBilled + ? WHERE cardNumber = ? and owner = ? and expiration = ? and cvv = ?")
            if (this.throws) {
                throw "ERRRO";
            } else {
                return [[], []];
            }
        if(sql == "SELECT * FROM accounts WHERE cardNumber = ? and owner = ? and expiration = ? and cvv = ?")
            if (this.throws) {
                throw "ERRRO";
            } else {
                return [[{a: "b"}], []];
            }
        return [[], []];
    }

    public release() {
        return;
    }
}