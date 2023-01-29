import { use, expect, request } from "chai";
import chaiHttp = require("chai-http");
import { createSandbox, SinonStub } from "sinon";
import sinonChai = require("sinon-chai");
import app from "../../src/app";
import { User } from "../../src/model/User";
import { beforeEach } from "mocha";

use(chaiHttp);
use(sinonChai);

const sandbox = createSandbox();

describe("/register endpoint", () => {

    let requester: ChaiHttp.Agent;
    let registerNewUserStub: SinonStub;

    before(() => {
        requester = request(app.express).keepOpen();
    });

    after(() => {
        requester.close();
    });

    beforeEach(() => {
        registerNewUserStub = sandbox.stub(User, "registerNewUser");
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

        it ("should fail if the registration of the user in the DB fails", async () => {
            registerNewUserStub.resolves(false);
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
            registerNewUserStub.resolves(true);
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