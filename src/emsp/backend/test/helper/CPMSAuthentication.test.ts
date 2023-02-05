import { use, expect, request } from "chai";
import chaiHttp = require("chai-http");
import { createSandbox, SinonStub } from "sinon";
import sinonChai = require("sinon-chai");
import app from "../../src/app";
import { beforeEach } from "mocha";
import {Booking, DateIntervalPerSocket} from "../../src/model/Booking";
import Authentication from "../../src/helper/authentication";
import {CPMS, ICPMS} from "../../src/model/CPMS";
import axios from "axios";
import { DBAccess } from "../../src/DBAccess";
import CPMSAuthentication from "../../src/helper/CPMSAuthentication";

use(chaiHttp);
use(sinonChai);

const sandbox = createSandbox();

describe("CPMS Authentication helper class", () => {

    let axiosPostStub: SinonStub;
    let DBStub: SinonStub;

    beforeEach(() => {
        axiosPostStub = sandbox.stub(axios, "post");
        DBStub = sandbox.stub(DBAccess, "getConnection");
    });

    afterEach(() => {
        sandbox.restore();
    });

    it("Should not contact the CPMS if the token is valid", async () => {
        const cookieStr = "__session=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjoiZDE4YmIyNWMtZmYwOC00YmNlLWI3NzUtMzc3NzRkMjAzNGI5IiwidXNlcm5hbWUiOiJlTWFsbCIsImlkIjoxLCJpYXQiOjE2NzU1NTUwMjQsImV4cCI6NTAwMDAwMDAwMH0.b5KgZhFtnwLyOFN_l9O91mpPVZrupYWcxMebp4evIJM; Path=/; Expires=Fri, 11 Jun 2128 8:53:20 GMT; HttpOnly; Secure; SameSite=None";
        const cpmsValid = {
            id: 1,
            name: "CPMS1",
            endpoint: "http://127.0.0.1:8001",
            apiKey: "JinSakai",
            token: cookieStr
        }
        const cpmsRes = await CPMSAuthentication.getTokenIfNeeded(cpmsValid);
        expect(cpmsRes).to.be.eql(cpmsValid);
        expect(axiosPostStub).to.not.have.been.called;
    });

    it("Should contact the CPMS if the token is expired", async () => {
        const cookieStr = "__session=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjoiZDE4YmIyNWMtZmYwOC00YmNlLWI3NzUtMzc3NzRkMjAzNGI5IiwidXNlcm5hbWUiOiJlTWFsbCIsImlkIjoxLCJpYXQiOjE2NzU1NTUwMjQsImV4cCI6MH0.9Uzh2Ib5PZK82qzIHydBSMXE9tIKl4_AGxwKG1s78l0; Path=/; Expires=Thu, 1 Jan 1960 0:00:00 GMT; HttpOnly; Secure; SameSite=None";
        const cookieValid = "__session=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjoiZDE4YmIyNWMtZmYwOC00YmNlLWI3NzUtMzc3NzRkMjAzNGI5IiwidXNlcm5hbWUiOiJlTWFsbCIsImlkIjoxLCJpYXQiOjE2NzU1NTUwMjQsImV4cCI6NTAwMDAwMDAwMH0.b5KgZhFtnwLyOFN_l9O91mpPVZrupYWcxMebp4evIJM; Path=/; Expires=Fri, 11 Jun 2128 8:53:20 GMT; HttpOnly; Secure; SameSite=None";
        const cpmsExpired = {
            id: 1,
            name: "CPMS1",
            endpoint: "http://127.0.0.1:8001",
            apiKey: "JinSakai",
            token: cookieStr
        }
        const cpmsValid = {
            id: 1,
            name: "CPMS1",
            endpoint: "http://127.0.0.1:8001",
            apiKey: "JinSakai",
            token: cookieValid
        }
        const cookieHeaders: Record<string, any> = {};
        cookieHeaders["set-cookie"] = [cookieValid]
        DBStub.resolves(new Test1());
        axiosPostStub.resolves({ status: 200, data: { data: {} }, headers: cookieHeaders });
        const cpmsRes = await CPMSAuthentication.getTokenIfNeeded(cpmsExpired);
        expect(cpmsRes).to.be.eql(cpmsValid);
        expect(axiosPostStub).to.have.been.called;
    });

    it("Should not update the cookie in case of errors", async () => {
        const cookieStr = "__session=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjoiZDE4YmIyNWMtZmYwOC00YmNlLWI3NzUtMzc3NzRkMjAzNGI5IiwidXNlcm5hbWUiOiJlTWFsbCIsImlkIjoxLCJpYXQiOjE2NzU1NTUwMjQsImV4cCI6MH0.9Uzh2Ib5PZK82qzIHydBSMXE9tIKl4_AGxwKG1s78l0; Path=/; Expires=Thu, 1 Jan 1960 0:00:00 GMT; HttpOnly; Secure; SameSite=None";
        const cpmsExpired = {
            id: 1,
            name: "CPMS1",
            endpoint: "http://127.0.0.1:8001",
            apiKey: "JinSakai",
            token: cookieStr
        }
        axiosPostStub.throws({ response: { data: { message: "Nothing " } } });
        const cpmsRes = await CPMSAuthentication.getTokenIfNeeded(cpmsExpired);
        expect(cpmsRes).to.be.eql(cpmsExpired);
        expect(axiosPostStub).to.have.been.called;
    });

    it("Should not update the cookie in case of DB errors", async () => {
        const cookieStr = "__session=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjoiZDE4YmIyNWMtZmYwOC00YmNlLWI3NzUtMzc3NzRkMjAzNGI5IiwidXNlcm5hbWUiOiJlTWFsbCIsImlkIjoxLCJpYXQiOjE2NzU1NTUwMjQsImV4cCI6MH0.9Uzh2Ib5PZK82qzIHydBSMXE9tIKl4_AGxwKG1s78l0; Path=/; Expires=Thu, 1 Jan 1960 0:00:00 GMT; HttpOnly; Secure; SameSite=None";
        const cpmsExpired = {
            id: 1,
            name: "CPMS1",
            endpoint: "http://127.0.0.1:8001",
            apiKey: "JinSakai",
            token: cookieStr
        }
        const cookieHeaders: Record<string, any> = {};
        cookieHeaders["set-cookie"] = [cookieStr]
        DBStub.resolves(new Test2())
        axiosPostStub.resolves({ status: 200, data: { data: {} }, headers: cookieHeaders });
        const cpmsRes = await CPMSAuthentication.getTokenIfNeeded(cpmsExpired);
        expect(cpmsRes).to.be.eql(cpmsExpired);
        expect(axiosPostStub).to.have.been.called;
    });
});

class Test1 {
    public async execute(sql: string, values: any) : Promise<[any[], any[]]> {
        if(sql == "UPDATE cpmses SET token = ? WHERE id = ?")
            return [({ affectedRows: 1 } as unknown as any[]), []];
        return [[], []];
    }

    public release() {
        return;
    }

    public async beginTransaction() {
        return;
    }

    public async commit() {
        return;
    }
}

class Test2 {
    public async execute(sql: string, values: any) : Promise<[any[], any[]]> {
        if(sql == "UPDATE cpmses SET token = ? WHERE id = ?")
            throw "DB Error!";
        return [[], []];
    }

    public release() {
        return;
    }

    public async beginTransaction() {
        return;
    }

    public async commit() {
        return;
    }
}