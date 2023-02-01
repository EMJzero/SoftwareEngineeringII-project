import Authentication from "../../src/helper/authentication";
import { expect } from "chai";
import * as sinon from "sinon";
import { Emsp } from "../../src/model/Emsp";
import { Request, Response } from "express";
import * as http_internal from "../../src/helper/http";
import "../../src/app";

const sandbox = sinon.createSandbox();

describe("Authentication helper module", () => {

    const testUser = {
        name: "ARandomName",
        APIKey: "ARandomKey"
    };

    const mockResponse: Partial<Response> = {
        statusCode: 200,
        status: sandbox.mock().resolves(this),
        json: sandbox.mock().resolves(this),
        cookie: sandbox.mock(),
        clearCookie: sandbox.mock()
    };

    let responseCode = 0;

    before(async () => {
        sandbox.stub(http_internal, "unauthorizedUserError").callsFake(() => {
            responseCode = 401;
        });

        sandbox.stub(http_internal, "internalServerError").callsFake(() => {
            responseCode = 500;
        });
    });

    after(async () => {
        sandbox.restore();
    });

    it("should create a JWT secret", () => {
        expect(Authentication.createJWT(testUser.name)).to.be.not.undefined;
    });

    it("should check a JWT secret in request", () => {
        const token = Authentication.createJWT(testUser.name);
        const mockRequest = {
            body: {},
            cookies: {
                _jwt: token
            }
        } as Request;
        const mockResponse = {} as Response;
        Authentication.checkAuthentication(mockRequest, mockResponse, () => {
            expect(mockResponse.statusCode).to.be.not.equal(401);
            expect(mockResponse.statusCode).to.be.not.equal(500);
        });
    });

    it("should throw unauthenticated error without JWT token", () => {
        const mockRequest = {
            body: {},
            cookies: {}
        } as Request;

        Authentication.checkAuthentication(mockRequest, mockResponse as Response, () => {
            console.log("Next");
        });
        expect(responseCode).to.be.equal(401);
    });

    it("should throw unauthenticated error with wrong JWT token", () => {
        const mockRequest = {
            body: {},
            cookies: { _jwt: "A non-JWT string" }
        } as Request;

        Authentication.checkAuthentication(mockRequest, mockResponse as Response, () => {
            console.log("Next");
        });
        expect(responseCode).to.be.equal(401);
    });

    it("should throw unauthenticated error with JWT token without user_id string", () => {
        const mockRequest = {
            body: {},
            cookies: { _jwt: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.8c7UutxCZwhe71a7pyVjNPYou5Xp6TGrjhETFuIB11o" }
        } as Request;

        Authentication.checkAuthentication(mockRequest, mockResponse as Response, () => {
            console.log("Next");
        });
        expect(responseCode).to.be.equal(401);
    });

    /*it("should throw internal user error", () => {
        const mockRequest = {
            body: {},
            cookies: {}
        } as Request;

        const originalJWTSECRET = process.env.JWT_SECRET;
        delete process.env.JWT_SECRET;

        console.log(process.env.JWT_SECRET);
        Authentication.checkAuthentication(mockRequest, mockResponse as Response, () => {
            console.log("Next");
        });
        expect(responseCode).to.be.equal(500);
        expect(mockRequest.userId).to.be.undefined;

        process.env.JWT_SECRET = originalJWTSECRET;
    });*/
});