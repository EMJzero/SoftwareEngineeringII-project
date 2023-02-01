import { use, expect, request } from "chai";
import chaiHttp = require("chai-http");
import { createSandbox, SinonStub } from "sinon";
import sinonChai = require("sinon-chai");
import app from "../../src/app";
import { beforeEach } from "mocha";
import Authentication from "../../src/helper/authentication";
import CSConnection from "../../src/model/CSConnection";
import { DBAccess } from "../../src/DBAccess";

use(chaiHttp);
use(sinonChai);

const sandbox = createSandbox();

describe("/cs-manager endpoint", () => {

    let requester: ChaiHttp.Agent;
    let checkJWTStub: SinonStub;
    let DBStub: SinonStub;

    before(() => {
        requester = request(app.express).keepOpen();
    });

    after(() => {
        requester.close();
    });

    beforeEach(() => {
        checkJWTStub = sandbox.stub(Authentication, "checkJWT");
        DBStub = sandbox.stub(DBAccess, "getConnection");
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe("GET /", () => {

        it("should fail if all parameters are missing", async () => {
            checkJWTStub.returns(
                { mspName: "emsp1" }
            );
            const res = await requester.get("/cs-list");
            expect(res).to.have.status(400);
        });

        it("should fail with invalid locationLatitude", async () => {
            checkJWTStub.returns(
                { mspName: "emsp1" }
            );
            const res = await requester.get("/cs-list?" +
                "locationLatitude=-125" +
                "&locationLongitude=160" +
                "&locationRange=5" +
                "&priceLowerBound=2" +
                "&priceUpperBound=12");
            expect(res).to.have.status(400);
        });

        it("should fail with invalid locationLongitude", async () => {
            checkJWTStub.returns(
                { mspName: "emsp1" }
            );
            const res = await requester.get("/cs-list?" +
                "locationLatitude=25" +
                "&locationLongitude=260" +
                "&locationRange=5" +
                "&priceLowerBound=2" +
                "&priceUpperBound=12");
            expect(res).to.have.status(400);
        });

        it("should fail with invalid locationRange", async () => {
            checkJWTStub.returns(
                { mspName: "emsp1" }
            );
            const res = await requester.get("/cs-list?" +
                "locationLatitude=25" +
                "&locationLongitude=160" +
                "&locationRange=-5" +
                "&priceLowerBound=2" +
                "&priceUpperBound=12");
            expect(res).to.have.status(400);
        });

        it("should fail with invalid priceLowerBound", async () => {
            checkJWTStub.returns(
                { mspName: "emsp1" }
            );
            const res = await requester.get("/cs-list?" +
                "locationLatitude=25" +
                "&locationLongitude=160" +
                "&locationRange=5" +
                "&priceLowerBound=-2" +
                "&priceUpperBound=12");
            expect(res).to.have.status(400);
        });

        it("should fail with invalid priceUpperBound", async () => {
            checkJWTStub.returns(
                { mspName: "emsp1" }
            );
            const res = await requester.get("/cs-list?" +
                "locationLatitude=25" +
                "&locationLongitude=160" +
                "&locationRange=5" +
                "&priceLowerBound=2" +
                "&priceUpperBound=1");
            expect(res).to.have.status(400);
        });

        it("should fail if DB access fails", async () => {
            DBStub.throws("Sorry not sorry");
            checkJWTStub.returns(
                { mspName: "emsp1" }
            );
            const res = await requester.get("/cs-list?" +
                "CSID=1");
            expect(res).to.have.status(500);
        });

        it("should succeed for the CSID", async () => {
            DBStub.resolves(new Test1());
            checkJWTStub.returns(
                { mspName: "emsp1" }
            );
            const res = await requester.get("/cs-list?" +
                "CSID=1");
            expect(res).to.have.status(200);
        });

        it("should succeed for the filters", async () => {
            DBStub.resolves(new Test1());
            checkJWTStub.returns(
                { mspName: "emsp1" }
            );
            const res = await requester.get("/cs-list?" +
                "locationLatitude=25" +
                "&locationLongitude=160" +
                "&locationRange=5" +
                "&priceLowerBound=2" +
                "&priceUpperBound=12");
            expect(res).to.have.status(200);
        });
    });
});

class Test1 {
    public async execute(sql: string, values: any) : Promise<[any[], any[]]> {
        if(sql == "SELECT * FROM cs WHERE id = ?")
            return [[{ id: 1,
                locationLatitude: 1,
                locationLongitude: 1,
                name: "aaa",
                nominalPrice: 1,
                userPrice: 2,
                offerExpirationDate: "123",
                imageURL: "aaa" }], []];
        if(sql == "SELECT s.id, t.connector, t.maxpower FROM cssockets s JOIN socketstype t ON s.typeid = t.id WHERE s.csid = ?")
            return [[{ id: 1,
                connector: 50,
                maxpower: 10
            }], []];
        return [[], []];
    }

    public release() {
        return;
    }
}