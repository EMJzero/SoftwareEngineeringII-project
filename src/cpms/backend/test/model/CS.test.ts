import { use, expect, request } from "chai";
import chaiHttp = require("chai-http");
import { createSandbox, SinonStub } from "sinon";
import sinonChai = require("sinon-chai");
import app from "../../src/app";
import { beforeEach } from "mocha";
import Authentication from "../../src/helper/authentication";
import CSConnection, { CSDB, SocketMachine } from "../../src/model/CSConnection";
import { DBAccess } from "../../src/DBAccess";
import { RowDataPacket } from "mysql2/promise";
import { CS } from "../../src/model/CS";

use(chaiHttp);
use(sinonChai);

const sandbox = createSandbox();

describe("CS model", () => {

    let DBStub: SinonStub;

    beforeEach(() => {
        DBStub = sandbox.stub(DBAccess, "getConnection");
    });

    afterEach(() => {
        sandbox.restore();
    });

    it("should fail to verify the CS and sockets if the DB fails", async () => {
        DBStub.resolves(new Test1([], true));
        let thrown = false;
        try {
            await CS.verifyCSandSockets(1, [1, 2, 3]);
        } catch (e) {
            thrown = true;
        }
        expect(thrown).to.be.true;
    });

    it("should fail to verify the CS and sockets if the DB returns empty", async () => {
        DBStub.resolves(new Test1([{
            res: 0
        }], false));
        expect(await CS.verifyCSandSockets(1, [1, 2, 3])).to.be.false;
    });

    it("should fail to verify the CS and sockets if the DB returns an invalid number of valid sockets", async () => {
        DBStub.resolves(new Test1([{
            res: 2
        }], false));
        expect(await CS.verifyCSandSockets(1, [1, 2, 3])).to.be.false;
    });

    it("should succeed to verify the CS and sockets if the DB returns OK", async () => {
        DBStub.resolves(new Test1([{
            res: 3
        }], false));
        expect(await CS.verifyCSandSockets(1, [1, 2, 3])).to.be.true;
    });

    it("should fail to get CS details if the DB fails", async () => {
        DBStub.resolves(new Test2(true));
        let thrown = false;
        try {
            await CS.getCSDetails(1);
        } catch (e) {
            thrown = true;
        }
        expect(thrown).to.be.true;
    });

    it("should fail to get CS details if no CS is found", async () => {
        DBStub.resolves(new Test3(false));
        const res = await CS.getCSDetails(1);
        expect(res).to.be.null;
    });

    it("should succeed to get CS details", async () => {
        DBStub.resolves(new Test2(false));
        const res = await CS.getCSDetails(1);
        const expected = new CS(1, "1", 0, 0, 0, 0, 0, [{ id: 1, type: { connector: "Conn 1", maxPower: 10 } }, { id: 2, type: { connector: "Conn 2", maxPower: 20 } }], "");
        expect(res).to.be.eql(expected);
    });

    it("should fail to get CS list if the DB fails", async () => {
        DBStub.resolves(new Test2(true));
        let throws = false;
        try {
            const res = await CS.getCSList(0, 0, 0, 0, 0);
        } catch {
            throws = true;
        }
        expect(throws).to.be.true;
    });

    it("should report empty list if no CSes are found", async () => {
        DBStub.resolves(new Test3(false));
        const res = await CS.getCSList(0, 0, 0, 0, 0);
        expect(res).to.be.eql([]);
    });

    it("should succeed to get CS details", async () => {
        DBStub.resolves(new Test2(false));
        const res = await CS.getCSList(0, 0, 0, 0, 0,);
        const expected = [new CS(1, "1", 0, 0, 0, 0, 0, null, ""), new CS(2, "2", 0, 0, 0, 0, 0, null, "")];
        expect(res).to.be.eql(expected);
    });
});

class Test1 {

    private result: [any[], any[]];
    private throws: boolean;

    constructor(result: any[], throws: boolean) {
        this.result = [result, []];
        this.throws = throws;
    }

    public async execute(sql: string, values: any) : Promise<[any[], any[]]> {
        if(sql == "SELECT count(*) AS res FROM cs c JOIN cssockets s ON c.id = s.csid WHERE c.id = 1 AND s.id IN (1, 2, 3)")
            if (this.throws) {
                throw "Errror";
            } else {
                return this.result;
            }
        return [[], []];
    }

    public format(sql: string, values: any) : string {
        return sql;
    }

    public async query(sql: string): Promise<[any[], any[]]> {
        if(sql == "SELECT count(*) AS res FROM cs c JOIN cssockets s ON c.id = s.csid WHERE c.id = 1 AND s.id IN (1, 2, 3)")
            if (this.throws) {
                throw new Error();
            } else {
                return this.result;
            }
        return [[], []];
    }

    public release() {
        return;
    }
}

class Test2 {

    private throws: boolean;

    constructor(throws: boolean) {
        this.throws = throws;
    }

    public async execute(sql: string, values: any) : Promise<[any[], any[]]> {
        if(sql == "SELECT * FROM cs WHERE id = ?")
            if (this.throws) {
                throw "Errror";
            } else {
                return [[{
                    id: 1,
                    name: "1",
                    locationLatitude: 0,
                    locationLongitude: 0,
                    nominalPrice: 0,
                    userPrice: 0,
                    offerExpirationDate: 0,
                    imageURL: ""
                }/*, {
                    id: 2,
                    name: "2",
                    locationLatitude: 0,
                    locationLongitude: 0,
                    nominalPrice: 0,
                    userPrice: 0,
                    offerExpirationDate: 0,
                    imageURL: ""
                }*/], []];
            }
        if (sql == "SELECT s.id, t.connector, t.maxpower FROM cssockets s JOIN socketstype t ON s.typeid = t.id WHERE s.csid = ?") {
            if (this.throws) {
                throw "Errror";
            } else {
                return [[{
                    id: 1,
                    connector: "Conn 1",
                    maxpower: 10
                }, {
                    id: 2,
                    connector: "Conn 2",
                    maxpower: 20
                }], []];
            }
        }
        if(sql == "SELECT * FROM cs WHERE (userPrice >= ? AND userPrice <= ?) AND (locationLatitude >= ? - ? AND locationLatitude <= ? + ?) AND (locationLongitude >= ? - ? AND locationLongitude <= ? + ?)")
            if (this.throws) {
                throw "Errror";
            } else {
                return [[{
                    id: 1,
                    name: "1",
                    locationLatitude: 0,
                    locationLongitude: 0,
                    nominalPrice: 0,
                    userPrice: 0,
                    offerExpirationDate: 0,
                    imageURL: ""
                }, {
                    id: 2,
                    name: "2",
                    locationLatitude: 0,
                    locationLongitude: 0,
                    nominalPrice: 0,
                    userPrice: 0,
                    offerExpirationDate: 0,
                    imageURL: ""
                }], []];
            }
        return [[], []];
    }

    public release() {
        return;
    }
}

class Test3 {

    private throws: boolean;

    constructor(throws: boolean) {
        this.throws = throws;
    }

    public async execute(sql: string, values: any) : Promise<[any[], any[]]> {
        if(sql == "SELECT * FROM cs WHERE id = ?")
            if (this.throws) {
                throw "Errror";
            } else {
                return [[], []];
            }
        if (sql == "SELECT s.id, t.connector, t.maxpower FROM cssockets s JOIN socketstype t ON s.typeid = t.id WHERE s.csid = ?") {
            if (this.throws) {
                throw "Errror";
            } else {
                return [[{
                    id: 1,
                    connector: "Conn 1",
                    maxpower: 10
                }, {
                    id: 2,
                    connector: "Conn 2",
                    maxpower: 20
                }], []];
            }
        }
        return [[], []];
    }

    public release() {
        return;
    }
}