import * as sinon from "sinon";
import {SinonStub} from "sinon";
import {expect, use} from "chai";
const sinonChai = require("sinon-chai");
import {afterEach, beforeEach, describe, test} from "vitest";
import axiosInstance from "../../src/helpers/axios_service";
import {UserModel} from "../../src/model/user_model";
import BookingModel from "../../src/model/booking_model";
import bookings_controller from "../../src/controllers/bookings_controller";
import NotificationModel from "../../src/model/notification_model";
import notification_controller from "../../src/controllers/notification_controller";
import StationDetailsModel from "../../src/model/station_details_model";
import StationModel from "../../src/model/station_model";
import Socket, {SocketType} from "../../src/model/socket_model";
import recent_bookings_controller from "../../src/controllers/recent_bookings_controller";
import StationAvailabilityModel from "../../src/model/station_availability_model";
import station_availability_controller from "../../src/controllers/station_availability_controller";
import AvailableIntervalsModel from "../../src/model/available_intervals_model";

use(sinonChai);
const sandbox = sinon.createSandbox();

describe("Station Availability Tests", () => {
    let getStub: SinonStub;

    beforeEach(() => {
        getStub = sandbox.stub(axiosInstance, "get");
    });

    afterEach(() => {
        sandbox.restore();
    });

    test("Should correctly fetch availability", async () => {
        const availability = [new StationAvailabilityModel(new Date(2023, 2, 30, 11).valueOf(), new Date(2023, 2, 30, 13).valueOf())]
        station_availability_controller.getRef().value = null;
        getStub.resolves({ data: { data: availability } });
        await station_availability_controller.getAvailableSlots(1, 1, 1, new Date(2023, 2, 30));
        expect(station_availability_controller.getRef().value).to.be.eql([new AvailableIntervalsModel(new Date(2023, 2, 30), 11, 12, 1), new AvailableIntervalsModel(new Date(2023, 2, 30), 12, 13, 1)]);
    });

    test("Should correctly fetch availability outside of the availability range", async () => {
        const availability = [new StationAvailabilityModel(new Date(2023, 2, 30, 11).valueOf(), new Date(2023, 2, 30, 13).valueOf())]
        station_availability_controller.getRef().value = null;
        getStub.resolves({ data: { data: availability } });
        await station_availability_controller.getAvailableSlots(1, 1, 1, new Date(2023, 2, 31));
        expect(station_availability_controller.getRef().value).to.be.eql([]);
    });

    test("Should not reset availability with errors", async () => {
        station_availability_controller.getRef().value = [];
        getStub.resolves({ data: { data: null } });
        await station_availability_controller.getAvailableSlots(1, 1, 1, new Date(2023, 2, 30, 11, 10));
        expect(station_availability_controller.getRef().value).to.be.eql([]);
    });

    test("Should return empty availability in case of undefined parameters", async () => {
        station_availability_controller.getRef().value = [];
        getStub.resolves({ data: { data: null } });
        await station_availability_controller.getAvailableSlots(1, 1, 1, undefined);
        expect(station_availability_controller.getRef().value).to.be.eql([]);
    });

});