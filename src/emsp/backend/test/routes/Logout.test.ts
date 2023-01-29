import { use, request, expect } from "chai";
import chaiHttp = require("chai-http");
import { createSandbox, SinonStub } from "sinon";
import sinonChai = require("sinon-chai");
import app from "../../src/app";
import Authentication from "../../src/helper/authentication";
import { beforeEach } from "mocha";

use(chaiHttp);
use(sinonChai);

const sandbox = createSandbox();

describe("/logout endpoint", () => {

    let requester: ChaiHttp.Agent;
    let checkJWTStub: SinonStub;

    before(() => {
        requester = request(app.express).keepOpen();
    });

    after(() => {
        requester.close();
    });

    beforeEach(() => {
        checkJWTStub = sandbox.stub(Authentication, "checkJWT");
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe("GET /", () => {
        it("should succeed", async () => {
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            const res = await requester.get("/logout");
            expect(res).to.have.status(200);
        });
    });
});