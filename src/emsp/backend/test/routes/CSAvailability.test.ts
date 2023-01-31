import { use, expect, request } from "chai";
import chaiHttp = require("chai-http");
import { createSandbox, SinonStub } from "sinon";
import sinonChai = require("sinon-chai");
import app from "../../src/app";
import { beforeEach } from "mocha";
import axios from "axios";
import Authentication from "../../src/helper/authentication";
import { CPMS } from "../../src/model/CPMS";
import { Booking } from "../../src/model/Booking";
import { DBAccess } from "../../src/DBAccess";

use(chaiHttp);
use(sinonChai);

const sandbox = createSandbox();

describe("/cs-availability endpoint", () => {

    let requester: ChaiHttp.Agent;
    let checkJWTStub: SinonStub;
    //let CPMSStub: SinonStub;
    //let availableTimeSlotsStub: SinonStub;
    //let executeStub: SinonStub;
    let DBStub: SinonStub;

    before(() => {
        requester = request(app.express).keepOpen();
    });

    after(() => {
        requester.close();
    });

    beforeEach(() => {
        checkJWTStub = sandbox.stub(Authentication, "checkJWT");
        //CPMSStub = sandbox.stub(CPMS, "findById");
        //availableTimeSlotsStub = sandbox.stub(Booking, "getAvailableTimeSlots");
        //executeStub = sandbox.stub(PoolConnection.prototype, "execute");
        DBStub = sandbox.stub(DBAccess, "getConnection");
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe("GET /", () => {

        it("should fail when some fields are missing fails", async () => {
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            const res = await requester.get("/cs-availability?stationID=1" +
                "&socketID=1" +
                "&cpmsID=1" +
                "&referenceDateDay=13" +
                "&referenceDateYear=2023");
            expect(res).to.have.status(400);
        });

        it("should fail if the DB access for CPMS fails", async () => {
            DBStub.throws("No connection for you :) !");
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            //CPMSStub.throws("No CPMS for you!");
            const res = await requester.get("/cs-availability?stationID=1" +
                "&socketID=1" +
                "&cpmsID=1" +
                "&referenceDateDay=13" +
                "&referenceDateMonth=7" +
                "&referenceDateYear=2023");
            expect(res).to.have.status(500);
        });

        it("should fail if the given cpms name is invalid", async () => {
            DBStub.resolves(new Test2());
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            //CPMSStub.resolves(null);
            const res = await requester.get("/cs-availability?stationID=1" +
                "&socketID=1" +
                "&cpmsID=1" +
                "&referenceDateDay=13" +
                "&referenceDateMonth=7" +
                "&referenceDateYear=2023");
            expect(res).to.have.status(400);
        });

        it("should return nothing if the stationID is invalid", async () => {
            DBStub.resolves(new Test1());
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            //CPMSStub.resolves({ endpoint: "endpointTippityToppy" });
            const res = await requester.get("/cs-availability?stationID=1" +
                "&socketID=1" +
                "&cpmsID=1" +
                "&referenceDateDay=13" +
                "&referenceDateMonth=7" +
                "&referenceDateYear=2023");
            expect(res.body).to.be.eql({ "data": {}, "message": "", "status": true });
            expect(res).to.have.status(200);
        });

        it("should succeed when all the parameters are well defined", async () => {
            DBStub.resolves(new Test1());
            checkJWTStub.returns(
                { userId: 1, username: "userName" }
            );
            //CPMSStub.resolves({ endpoint: "endpointTippityToppy" });
            const res = await requester.get("/cs-availability?stationID=1" +
                "&socketID=1" +
                "&cpmsID=1" +
                "&referenceDateDay=13" +
                "&referenceDateMonth=7" +
                "&referenceDateYear=2023");
            expect(res).to.have.status(200);
        });
    });
});

class Test1 {
    public async execute(sql: string, values: any) : Promise<[any[], any[]]> {
        if(sql == "SELECT * FROM cpmses WHERE id = ?")
            return [[{ id: 123, name: "CPMS1", APIendpoint: "http://test.com", APIkey: "nothing" }], []];
        if(sql == "WITH timeSlots(start, end) AS (SELECT b1.endDate, b2.startDate FROM bookings b1 JOIN bookings b2 ON b1.cpmsId = b2.cpmsId AND b1.csId = b2.csId AND b1.socketId = b2.socketId\n" +
            "WHERE b1.endDate < b2.startDate AND cpmsId = ? AND csId = ? AND socketId = ? AND b1.endDate >= ? AND b2.startDate <= ? AND NOT EXISTS " +
            "(SELECT * FROM bookings b3 WHERE b1.cpmsId = b3.cpmsId AND b1.csId = b3.csId AND b1.socketId = b3.socketId AND (b3.startDate BETWEEN b1.endDate AND b2.startDate OR b3.startDate BETWEEN b1.endDate AND b2.startDate)) " +
            "UNION " +
            "(SELECT endDate, ? FROM bookings WHERE cpmsId = ? AND csId = ? AND socketId = ? AND endDate < ? GROUP BY endDate DESC LIMIT 1) " +
            "UNION " +
            "(SELECT ?, startDate FROM bookings WHERE cpmsId = ? AND csId = ? AND socketId = ? AND startDate > ? ORDER BY startDate ASC LIMIT 1)) " +
            "SELECT * FROM timeSlots")
            return [[{ start: new Date(0), end: new Date(10000000000) }], []];
        return [[], []];
    }

    public release() {
        return;
    }
}

class Test2 {
    public async execute(sql: string, values: any) : Promise<[any[], any[]]> {
        if(sql == "SELECT * FROM cpmses WHERE id = ?")
            return [[], []];
        return [[], []];
    }

    public release() {
        return;
    }
}