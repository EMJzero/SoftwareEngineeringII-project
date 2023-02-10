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
import booking_create_controller from "../../src/controllers/booking_create_controller";
import station_details_controller from "../../src/controllers/station_details_controller";

use(sinonChai);
const sandbox = sinon.createSandbox();

describe("Station Details Tests", () => {
    let getStub: SinonStub;

    beforeEach(() => {
        getStub = sandbox.stub(axiosInstance, "get");
    });

    afterEach(() => {
        sandbox.restore();
    });

    test("Should correctly fetch details", async () => {
        const test = new StationDetailsModel(new StationModel(1, "Test 1", 1, "CPMS1", 0, 0, 0, 0, null, [new Socket(1, new SocketType("1", 10))], ""), null);
        station_details_controller.getRef().value = null;
        getStub.resolves({ data: { data: test } });
        await station_details_controller.getStationDetails(1, 1);
        expect(station_details_controller.getRef().value).to.be.eql(test);
    });

    test("Should set details to null with errors", async () => {
        station_details_controller.getRef().value = null;
        getStub.resolves({ data: { data: null } });
        await station_details_controller.getStationDetails(1, 1);
        expect(station_details_controller.getRef().value).to.be.null;
    });

});