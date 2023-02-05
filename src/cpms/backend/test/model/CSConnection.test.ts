import { use, expect, request } from "chai";
import chaiHttp = require("chai-http");
import { createSandbox, SinonStub } from "sinon";
import sinonChai = require("sinon-chai");
import app from "../../src/app";
import { afterEach, beforeEach } from "mocha";
import Authentication from "../../src/helper/authentication";
import CSConnection, { CarData, CSDB, SocketMachine } from "../../src/model/CSConnection";
import { DBAccess } from "../../src/DBAccess";
import { RowDataPacket } from "mysql2/promise";
import { CS } from "../../src/model/CS";
import EventEmitter = require("events");
import WebSocket = require("ws");
import WSSync from "../../src/helper/websocket-sync";
import { Emsp } from "../../src/model/Emsp";
import axios from "axios";

use(chaiHttp);
use(sinonChai);

const sandbox = createSandbox();

describe("CS model", () => {

    let DBStub: SinonStub;
    let uuidStub: SinonStub;
    let postStub: SinonStub;

    beforeEach(() => {
        DBStub = sandbox.stub(DBAccess, "getConnection");
        uuidStub = sandbox.stub(WSSync, "generateUUID");
        uuidStub.returns("CIAO");
        postStub = sandbox.stub(axios, "post");
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe("CSDB", async () => {

        it("should correctly register a CS", async () => {
            const dummyDB = new CSDB();
            const socket = new WebSocket(null);
            const conn1 = new CSConnection(1, socket);
            dummyDB.registerCS(conn1);
            dummyDB.registerCS(new CSConnection(2, socket));
            expect(dummyDB.getConnectionToCSWithID(1)).to.be.eql(conn1);
        });

        it("should correctly unregister a CS", async () => {
            const dummyDB = new CSDB();
            const socket = new WebSocket(null);
            const conn1 = new CSConnection(1, socket);
            const conn2 = new CSConnection(2, socket);
            dummyDB.registerCS(conn1);
            dummyDB.registerCS(conn2);
            dummyDB.unregisterCS(conn1);
            expect(dummyDB.getConnectionToCSWithID(2)).to.be.eql(conn2);
        });

        it("should keep everything the same if the CS to unregister is not found", async () => {
            const dummyDB = new CSDB();
            const socket = new WebSocket(null);
            const conn1 = new CSConnection(1, socket);
            const conn2 = new CSConnection(2, socket);
            const conn3 = new CSConnection(3, socket);
            dummyDB.registerCS(conn1);
            dummyDB.registerCS(conn2);
            dummyDB.unregisterCS(conn3);
            expect(dummyDB.getConnectionToCSWithID(1)).to.be.eql(conn1);
            expect(dummyDB.getConnectionToCSWithID(2)).to.be.eql(conn2);
        });

    });

    describe("CSConnection", async () => {

        it("should not start a charge if no sockets are reported", async () => {
            const mockConnection = new CSConnection(1, new WebSocket(null));
            const res = await mockConnection.startCharge(1, 0, 1);
            expect(res).to.be.false;
        });

        it("should not start a charge if the socket is not in teh correct state", async () => {
            const mockConnection = new CSConnection(1, new WebSocket(null));
            const socketStub = sandbox.stub(mockConnection, "sockets").returns([new SocketMachine(1, 1, 50, 10 )]);
            let thrown = false;
            try {
                const res = await mockConnection.startCharge(1, 0, 1);
            } catch {
                thrown = true;
            }
            expect(thrown).to.be.true;
        });

        it("should start a charge if the socket is OK", async () => {
            const mockConnection = new CSConnection(1, new WebSocket(null));
            const sock = new SocketMachine(1, 1, 50, 10 );
            sock.connectCar();
            const sock2 = new SocketMachine(1, 1, 50, 10 );
            sock2.connectCar();
            sock2.chargeCar(0, () => {}, 1);
            const socketStub = sandbox.stub(mockConnection, "sockets").returns([sock]);
            const sendStub = sandbox.stub(mockConnection.websocket, "send").resolves();
            const messageStub = sandbox.stub(mockConnection.socketSync, "isWaiting").returns(false);
            const waitStub = sandbox.stub(mockConnection.socketSync, "hasMsgInWaitQueue").returns(true);
            mockConnection.socketSync.handleMessage({ unique_id: "CIAO", status: true, sockets: [sock2] });
            const res = await mockConnection.startCharge(1, 0, 1);
            expect(res).to.be.true;
        });

        it("should not stop a charge if no sockets are reported", async () => {
            const mockConnection = new CSConnection(1, new WebSocket(null));
            const res = await mockConnection.stopCharge(1);
            expect(res).to.be.false;
        });

        it("should not stop a charge if the socket is not in teh correct state", async () => {
            const mockConnection = new CSConnection(1, new WebSocket(null));
            const socketStub = sandbox.stub(mockConnection, "sockets").returns([new SocketMachine(1, 1, 50, 10 )]);
            let thrown = false;
            try {
                const res = await mockConnection.stopCharge(1);
            } catch {
                thrown = true;
            }
            expect(thrown).to.be.true;
        });

        it("should stop a charge if the socket is OK", async () => {
            const mockConnection = new CSConnection(1, new WebSocket(null));
            const sock = new SocketMachine(1, 1, 50, 10 );
            sock.connectCar();
            sock.chargeCar(1000000, () => {}, 1);
            const socketStub = sandbox.stub(mockConnection, "sockets").returns([sock]);
            const sendStub = sandbox.stub(mockConnection.websocket, "send").resolves();
            const messageStub = sandbox.stub(mockConnection.socketSync, "isWaiting").returns(false);
            const waitStub = sandbox.stub(mockConnection.socketSync, "hasMsgInWaitQueue").returns(true);
            mockConnection.socketSync.handleMessage({ unique_id: "CIAO", status: true });
            const res = await mockConnection.stopCharge(1);
            expect(res).to.be.true;
        });

        it("should bill whenever the charge ends", async () => {
            const mockConnection = new CSConnection(1, new WebSocket(null));
            const sock = new SocketMachine(1, 1, 50, 10 );
            const sock2 = new SocketMachine(1, 1, 50, 10 );
            sock.connectCar();
            sock.chargeCar(1000000, () => {}, 1);
            const socketStub = sandbox.stub(mockConnection, "sockets").returns([sock]);
            const sendStub = sandbox.stub(mockConnection.websocket, "send").resolves();
            const messageStub = sandbox.stub(mockConnection.socketSync, "isWaiting").returns(false);
            const waitStub = sandbox.stub(mockConnection.socketSync, "hasMsgInWaitQueue").returns(true);
            postStub.resolves({ status: 200, data: { data: { nothingHere: null } } });
            DBStub.resolves(new Test1(false));
            mockConnection.socketSync.handleMessage({ unique_id: "CIAO", type: "chargeEnd", sockets: [sock2] });
            const res = await mockConnection.stopCharge(1);
            socketStub.restore();
            expect(res).to.be.true;
            expect(mockConnection.sockets()).to.be.eql([sock2]);
            expect(postStub).to.have.been.called;
        });

        it("should retry billing whenever the charge ends and axios fails", async () => {
            const clock = sandbox.useFakeTimers();
            const mockConnection = new CSConnection(1, new WebSocket(null));
            const sock = new SocketMachine(1, 1, 50, 10 );
            const sock2 = new SocketMachine(1, 1, 50, 10 );
            sock.connectCar();
            sock.chargeCar(1000000, () => {}, 1);
            const socketStub = sandbox.stub(mockConnection, "sockets").returns([sock]);
            const sendStub = sandbox.stub(mockConnection.websocket, "send").resolves();
            const messageStub = sandbox.stub(mockConnection.socketSync, "isWaiting").returns(false);
            const waitStub = sandbox.stub(mockConnection.socketSync, "hasMsgInWaitQueue").returns(true);
            const intervalSpy = sandbox.stub(clock, "setInterval");
            postStub.throws({ response: { data: { message: "Nothing " } } });
            DBStub.resolves(new Test1(false));
            mockConnection.socketSync.handleMessage({ unique_id: "CIAO", type: "chargeEnd", sockets: [sock2] });
            const res = await mockConnection.stopCharge(1);
            socketStub.restore();
            expect(res).to.be.true;
            expect(mockConnection.sockets()).to.be.eql([sock2]);
            expect(postStub).to.have.been.called;
            expect(intervalSpy).to.have.been.called;
        });

        it("should bill whenever the charge ends remotely", async () => {
            const mockConnection = new CSConnection(1, new WebSocket(null));
            const sock = new SocketMachine(1, 1, 50, 10 );
            const sock2 = new SocketMachine(1, 1, 50, 10 );
            sock.connectCar();
            sock.chargeCar(1000000, () => {}, 1);
            const socketStub = sandbox.stub(mockConnection, "sockets").returns([sock]);
            const sendStub = sandbox.stub(mockConnection.websocket, "send").resolves();
            const messageStub = sandbox.stub(mockConnection.socketSync, "isWaiting").returns(false);
            const waitStub = sandbox.stub(mockConnection.socketSync, "hasMsgInWaitQueue").returns(true);
            postStub.resolves({ status: 200, data: { data: { nothingHere: null } } });
            DBStub.resolves(new Test1(false));
            mockConnection.socketSync.handleMessage({ unique_id: "CIAO", type: "chargeEnd", sockets: [sock2] });
            await CSConnection.webSocketListener(JSON.stringify({ unique_id: "CIAO", type: "chargeEnd", sockets: [sock2] }), mockConnection);
            socketStub.restore();
            expect(mockConnection.sockets()).to.be.eql(JSON.parse(JSON.stringify([sock2])));
            expect(postStub).to.have.been.called;
        });

        it("should retry billing whenever the charge ends and axios fails", async () => {
            const clock = sandbox.useFakeTimers();
            const mockConnection = new CSConnection(1, new WebSocket(null));
            const sock = new SocketMachine(1, 1, 50, 10 );
            const sock2 = new SocketMachine(1, 1, 50, 10 );
            sock.connectCar();
            sock.chargeCar(1000000, () => {}, 1);
            const socketStub = sandbox.stub(mockConnection, "sockets").returns([sock]);
            const sendStub = sandbox.stub(mockConnection.websocket, "send").resolves();
            const messageStub = sandbox.stub(mockConnection.socketSync, "isWaiting").returns(false);
            const waitStub = sandbox.stub(mockConnection.socketSync, "hasMsgInWaitQueue").returns(true);
            const intervalSpy = sandbox.stub(clock, "setInterval");
            postStub.throws({ response: { data: { message: "Nothing " } } });
            DBStub.resolves(new Test1(false));
            mockConnection.socketSync.handleMessage({ unique_id: "CIAO", type: "chargeEnd", sockets: [sock2] });
            await CSConnection.webSocketListener(JSON.stringify({ unique_id: "CIAO", type: "chargeEnd", sockets: [sock2] }), mockConnection);
            socketStub.restore();
            expect(mockConnection.sockets()).to.be.eql(JSON.parse(JSON.stringify([sock2])));
            expect(postStub).to.have.been.called;
            expect(intervalSpy).to.have.been.called;
        });

        it("Should correctly update the sockets whenever a status message arrives", async () => {
            const mockConnection = new CSConnection(1, new WebSocket(null));
            const sock = new SocketMachine(1, 1, 50, 10 );
            const sock2 = new SocketMachine(1, 1, 50, 10 );
            sock.connectCar();
            sock.chargeCar(1000000, () => {}, 1);
            const socketStub = sandbox.stub(mockConnection, "sockets").returns([sock]);
            await CSConnection.webSocketListener(JSON.stringify({ unique_id: "CIAO", type: "socketsStatus", sockets: [sock2] }), mockConnection);
            socketStub.restore();
            expect(mockConnection.sockets()).to.be.eql(JSON.parse(JSON.stringify([sock2])));
        });

        it("Should correctly report the time remaining for a socket", async () => {
            const mockConnection = new CSConnection(1, new WebSocket(null));
            const sock = new SocketMachine(1, 1, 10, 10 );
            sock.connectCar();
            const carStub1 = sandbox.stub(sock.connectedCar, "batteryCapacityKWh").returns(10);
            const carStub2 = sandbox.stub(sock.connectedCar, "remainingCapacityKWh").returns(8);
            const carStub3 = sandbox.stub(sock.connectedCar, "maxAcceptedPowerKW").returns(10);
            const socketStub = sandbox.stub(mockConnection, "sockets").returns([sock]);
            const ref = Date.now();
            sock.chargeCar(720000, () => {}, 1);
            const timeRemaining = mockConnection.getTimeRemaining(1);
            expect((timeRemaining ?? 0) - Date.now()).to.be.lessThanOrEqual(720000);
            expect(ref - (timeRemaining ?? 0)).to.be.greaterThanOrEqual(720000);
        });

        it("Should correctly report undefined time if no socket is found", async () => {
            const mockConnection = new CSConnection(1, new WebSocket(null));
            const socketStub = sandbox.stub(mockConnection, "sockets").returns([]);
            const ref = Date.now();
            const timeRemaining = mockConnection.getTimeRemaining(1);
            expect(timeRemaining).to.be.undefined;
        });
    });

    describe("SocketMachine", async () => {

        beforeEach(() => {
            sandbox.useFakeTimers();
        });

        afterEach(() => {
            sandbox.restore();
        });

        it("Should correctly change the socket state when a car is connected", function () {
            const sock = new SocketMachine(1, 1, 10, 10 );
            expect(sock.connectedCar).to.be.undefined;
            sock.connectCar();
            expect(sock.state).to.be.eql(1);
            expect(sock.connectedCar).to.be.not.undefined;
        });

        it("Should avoid connecting a car if the state is incorrect",  () => {
            const sock = new SocketMachine(1, 1, 10, 10 );
            expect(sock.connectedCar).to.be.undefined;
            sock.connectCar();
            let throws = false;
            try {
                sock.connectCar();
            } catch {
                throws = true;
            }
            expect(sock.state).to.be.eql(1);
            expect(sock.connectedCar).to.be.not.undefined;
            expect(throws).to.be.true;
        });

        it("Should correctly change the socket state when a charge is started", function () {
            const sock = new SocketMachine(1, 1, 5, 5 );
            sock.connectCar();
            sock.chargeCar(10000, () => {}, 1);
            expect(sock.state).to.be.eql(2);
            expect(sock.currentPower).to.be.eql(5);
            expect(sock.activeeMSPId).to.be.eql(1);
        });

        it("Should avoid starting a charge if the state is incorrect",  () => {
            const sock = new SocketMachine(1, 1, 10, 10 );
            let throws = false;
            try {
                sock.chargeCar(10000, () => {}, 1);
            } catch {
                throws = true;
            }
            expect(sock.state).to.be.eql(0);
            expect(sock.connectedCar).to.be.undefined;
            expect(throws).to.be.true;
        });

        it("Should correctly change the socket state when a charge is stopped", function () {
            const sock = new SocketMachine(1, 1, 10, 10 );
            sock.connectCar();
            sock.chargeCar(10000, () => {}, 1);
            sock.stopChargeCar();
            expect(sock.state).to.be.eql(1);
            expect(sock.currentPower).to.be.eql(0);
        });

        it("Should avoid stopping a charge if the state is incorrect",  () => {
            const sock = new SocketMachine(1, 1, 10, 10 );
            let throws = false;
            try {
                sock.stopChargeCar();
            } catch {
                throws = true;
            }
            expect(sock.state).to.be.eql(0);
            expect(sock.connectedCar).to.be.undefined;
            expect(throws).to.be.true;
        });

        it("Should correctly change the socket state when a car is disconnected", function () {
            const sock = new SocketMachine(1, 1, 10, 10 );
            sock.connectCar();
            sock.disconnectCar();
            expect(sock.state).to.be.eql(0);
            expect(sock.connectedCar).to.be.undefined;
        });

        it("Should avoid disconnecting a car if the state is incorrect",  () => {
            const sock = new SocketMachine(1, 1, 10, 10 );
            sock.connectCar();
            sock.chargeCar(10000, () => {}, 1);
            let throws = false;
            try {
                sock.disconnectCar();
            } catch {
                throws = true;
            }
            expect(sock.state).to.be.eql(2);
            expect(sock.connectedCar).to.be.not.undefined;
            expect(throws).to.be.true;
        });

        it("Should correctly report the time remaining", function () {
            const sock = new SocketMachine(1, 1, 10, 10 );
            sock.connectCar();
            sock.chargeCar(Date.now() + 10000, () => {}, 1);
            expect(sock.getSocketFreedTimeRemaining()).to.be.greaterThanOrEqual(1000);
            expect(sock.getSocketFreedTimeRemaining()).to.be.lessThanOrEqual(10000);
            expect(sock.state).to.be.eql(2);
            expect(sock.connectedCar).to.not.be.undefined;
        });

        it("Should throw time remaining error if no charge is ongoing",  () => {
            const sock = new SocketMachine(1, 1, 10, 10 );
            sock.connectCar();
            let throws = false;
            try {
                sock.getSocketFreedTimeRemaining();
            } catch {
                throws = true;
            }
            expect(sock.state).to.be.eql(1);
            expect(sock.connectedCar).to.be.not.undefined;
            expect(throws).to.be.true;
        });

        it("Should correctly report the battery timestamp", function () {
            const sock = new SocketMachine(1, 1, 10, 10 );
            sock.connectCar();
            sock.chargeCar(10000, () => {}, 1);
            expect(sock.getFullBatteryTimestamp()).to.be.greaterThanOrEqual(Date.now());
            expect(sock.state).to.be.eql(2);
            expect(sock.connectedCar).to.not.be.undefined;
        });

        it("Should throw battery timestamp error if no charge is ongoing",  () => {
            const sock = new SocketMachine(1, 1, 10, 10 );
            sock.connectCar();
            let throws = false;
            try {
                sock.getFullBatteryTimestamp();
            } catch {
                throws = true;
            }
            expect(sock.state).to.be.eql(1);
            expect(sock.connectedCar).to.be.not.undefined;
            expect(throws).to.be.true;
        });

        it("Should fully charge car",  () => {
            const sock = new SocketMachine(1, 1, 10, 10 );
            sock.connectCar();
            sock.fullyChargeCar();
            expect(sock.state).to.be.eql(1);
            expect(sock.connectedCar.remainingCapacityKWh).to.be.eql(sock.connectedCar.batteryCapacityKWh);
        });
    });
});

class Test1 {

    private throws: boolean;

    constructor(throws: boolean) {
        this.throws = throws;
    }

    public async execute(sql: string, values: any) : Promise<[any[], any[]]> {
        if(sql == "SELECT * FROM emsps WHERE id = ?")
            if (this.throws) {
                throw "Errror";
            } else {
                return [[new Emsp(1, "JinSakai", "http://127.0.0.1:8000/cs-notification")], []];
            }
        if (sql == "SELECT * FROM cs WHERE id = ?") {
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
                }], []];
            }
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