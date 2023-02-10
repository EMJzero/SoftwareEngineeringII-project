import { SinonStub } from "sinon";
import * as sinon from "sinon";
import { use, expect } from "chai";
const sinonChai = require("sinon-chai");
import { afterEach, beforeEach, describe, test } from "vitest";
import axiosInstance from "../../src/helpers/axios_service";
import { UserModel } from "../../src/model/user_model";
import auth_controller from "../../src/controllers/authorization_controller";

use(sinonChai);
const sandbox = sinon.createSandbox();

describe("Auth Service Tests", () => {
    let getStub: SinonStub;
    let postStub: SinonStub;
    let userTest: UserModel = new UserModel("test", "email@email.it");

    beforeEach(() => {
        getStub = sandbox.stub(axiosInstance, "get");
        postStub = sandbox.stub(axiosInstance, "post");
    });

    afterEach(() => {
        sandbox.restore();
    });

    test("Shoud success with correct username and password", async () => {
        postStub.resolves({ data: { data: userTest } });
        const res = await auth_controller.login("username", "passwordlong");
        expect(res).to.be.eql(userTest);
    });

    test("Should fail with wrong username and password", async () => {
        postStub.resolves(null);
        const res = await auth_controller.login("username", "wrongpassword");
        expect(res).to.be.null;
    });

    test("Should fail with empyt username", async () => {
        postStub.resolves(null);
        const res = await auth_controller.login("", "wrongpassword");
        expect(res).to.be.null;
    });

    test("Should fail with empyt password", async () => {
        postStub.resolves(null);
        const res = await auth_controller.login("username", "");
        expect(res).to.be.null;
    });

    test("Should success with correct username, email and password", async () => {
        postStub.resolves({ data: { data: userTest } });
        const res = await auth_controller.register(
            "username",
            "email@email.it",
            "passwordlong",
            "USER NAME",
            "1234567891011121",
            "123",
            "11/22"
        );
        expect(res).to.true;
    });

    test("Should fail with low username length", async () => {
        postStub.resolves(null);
        const res = await auth_controller.register(
            "use",
            "email@email.it",
            "passwordlong",
            "USER NAME",
            "1234567891011121",
            "123",
            "11/22"
        );
        expect(res).to.false;
    });

    test("Should fail with not a Email format", async () => {
        postStub.resolves(null);
        const res = await auth_controller.register("username",
            "emailemail.it",
            "passwordlong",
            "USER NAME",
            "1234567891011121",
            "123",
            "11/22");
        expect(res).to.false;
    });

    test("Should fail with not a low password length", async () => {
        postStub.resolves(null);
        const res = await auth_controller.register("username",
            "email@email.it",
            "short",
            "USER NAME",
            "1234567891011121",
            "123",
            "11/22");
        expect(res).to.false;
    });

    test("Shoud succeed if has cookie", async () => {
        getStub.resolves({ data: { data: { status: true, message: "" } } });
        const res = await auth_controller.logout();
        expect(res).to.be.true;
    });

});