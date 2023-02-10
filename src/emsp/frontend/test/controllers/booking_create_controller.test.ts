import * as sinon from "sinon";
import {SinonStub} from "sinon";
import {expect, use} from "chai";
const sinonChai = require("sinon-chai");
import {afterEach, beforeEach, describe, test} from "vitest";
import axiosInstance from "../../src/helpers/axios_service";
import {UserModel} from "../../src/model/user_model";
import booking_create_controller from "../../src/controllers/booking_create_controller";
import StationDetailsModel, {DateIntervalPerSocket} from "../../src/model/station_details_model";
import StationModel from "../../src/model/station_model";
import Socket, {SocketType} from "../../src/model/socket_model";
import StationAvailabilityModel from "../../src/model/station_availability_model";
import AvailableIntervalsModel from "../../src/model/available_intervals_model";

use(sinonChai);
const sandbox = sinon.createSandbox();

describe("Booking Creation Tests", () => {
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

    test("Should correctly fetch station details from the server", async () => {
        const testData = new StationDetailsModel(new StationModel(1, "Test 1", 1, "CPMS1", 0, 0, 0, 0, null, [new Socket(1, new SocketType("1", 10))], ""), []);
        getStub.resolves({ data: { data: testData } });
        await booking_create_controller.getStationDetails(1, 1);
        expect(booking_create_controller.getRef().value).to.be.eql(testData);
    });

    test("Should fail with unknown CPMS", async () => {
        getStub.resolves({ data: { data: null } });
        await booking_create_controller.getStationDetails(99, 1);
        expect(booking_create_controller.getRef().value).to.be.null;
    });

    test("Should fail with unknown station", async () => {
        getStub.resolves({ data: { data: null } });
        await booking_create_controller.getStationDetails(1, 99);
        expect(booking_create_controller.getRef().value).to.be.null;
    });

    test("Should correctly get station availability", async () => {
        booking_create_controller.getRef().value = new StationDetailsModel(new StationModel(1, "Test 1", 1, "CPMS1", 0, 0, 0, 0, null, [new Socket(1, new SocketType("1", 10))], ""), null);
        getStub.resolves({ data: { data: [new StationAvailabilityModel(new Date(2023, 2, 30, 11).valueOf(), new Date(2023, 2, 30, 13).valueOf())] } });
        const res = await booking_create_controller.getStationAvailability("1", "Fast", new Date(2023, 2, 30));
        expect(res).to.be.eql([new AvailableIntervalsModel(new Date(2023, 2, 30), 11, 12, 1), new AvailableIntervalsModel(new Date(2023, 2, 30), 12, 13, 1)]);
    });

    test("Should correctly merge station availability for similar sockets", async () => {
        booking_create_controller.getRef().value = new StationDetailsModel(new StationModel(1, "Test 1", 1, "CPMS1", 0, 0, 0, 0, null, [new Socket(1, new SocketType("1", 10)), new Socket(2, new SocketType("1", 15))], ""), null);
        getStub.resolves({ data: { data: [new StationAvailabilityModel(new Date(2023, 2, 30, 11).valueOf(), new Date(2023, 2, 30, 13).valueOf())] } });
        const res = await booking_create_controller.getStationAvailability("1", "Fast", new Date(2023, 2, 30));
        expect(res).to.be.eql([new AvailableIntervalsModel(new Date(2023, 2, 30), 11, 12, 2), new AvailableIntervalsModel(new Date(2023, 2, 30), 12, 13, 2)]);
    });

    test("Should fail to get availability out of the available range", async () => {
        booking_create_controller.getRef().value = new StationDetailsModel(new StationModel(1, "Test 1", 1, "CPMS1", 0, 0, 0, 0, null, [new Socket(1, new SocketType("1", 10))], ""), null);
        getStub.resolves({ data: { data: [new StationAvailabilityModel(new Date(2023, 1, 1, 11).valueOf(), new Date(2023, 1, 1, 13).valueOf())] } });
        const res = await booking_create_controller.getStationAvailability("1", "Fast", new Date(Date.now()));
        expect(res).to.be.eql([]);
    });

    test("Should succeed in creating a booking for an available station", async () => {
        const test = new StationDetailsModel(new StationModel(1, "Test 1", 1, "CPMS1", 0, 0, 0, 0, null, [new Socket(1, new SocketType("1", 10))], ""), [new DateIntervalPerSocket(new Date(2023, 2, 30, 11), new Date(2023, 2, 30, 13), 1)]);
        booking_create_controller.getRef().value = test;
        postStub.resolves({ data: { data: test } });
        const res = await booking_create_controller.createBooking("1", "Fast", new Date(Date.now()), new AvailableIntervalsModel(new Date(Date.now()), 11, 12, 1));
        expect(res).to.be.true;
    });

    /*test("Should fail to create a booking when no slots are available", async () => {
        const test = new StationDetailsModel(new StationModel(1, "Test 1", 1, "CPMS1", 0, 0, 0, 0, null, [new Socket(1, new SocketType("1", 10))], ""), null);
        booking_create_controller.getRef().value = test;
        getStub.resolves({ data: { data: test } });
        const res = await booking_create_controller.createBooking("1", "Fast", new Date(Date.now()), new AvailableIntervalsModel(new Date(Date.now()), 11, 12, 1));
        expect(res).to.be.false;
    });*/

    test("Should fail to create a booking with undefined params", async () => {
        const test = new StationDetailsModel(new StationModel(1, "Test 1", 1, "CPMS1", 0, 0, 0, 0, null, [new Socket(1, new SocketType("1", 10))], ""), null);
        booking_create_controller.getRef().value = test;
        postStub.resolves({ data: { data: test } });
        const res = await booking_create_controller.createBooking(undefined, "Fast", undefined, new AvailableIntervalsModel(new Date(Date.now()), 11, 12, 1));
        expect(res).to.be.false;
    });

    test("Should fail to create a booking out of the availability range", async () => {
        booking_create_controller.getRef().value = new StationDetailsModel(new StationModel(1, "Test 1", 1, "CPMS1", 0, 0, 0, 0, null, [new Socket(1, new SocketType("1", 10))], ""), null);
        postStub.resolves({ data: { data: null } });
        const res = await booking_create_controller.createBooking("1", "Fast", new Date(Date.now()), new AvailableIntervalsModel(new Date(Date.now()), 11, 12, 1));
        expect(res).to.be.false;
    });

});