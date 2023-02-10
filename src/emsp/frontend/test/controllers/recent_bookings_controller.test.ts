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

use(sinonChai);
const sandbox = sinon.createSandbox();

describe("Recent Bookings Tests", () => {
    let getStub: SinonStub;

    beforeEach(() => {
        getStub = sandbox.stub(axiosInstance, "get");
    });

    afterEach(() => {
        sandbox.restore();
    });

    test("Should correctly fetch upcoming bookings", async () => {
        const testDataComplete = [new BookingModel("1", "Test", "Fast", "1", Date.now() - 10000, Date.now() + 10000, "", false, 1, 1, 1)];
        const testDataPartial = [new BookingModel("1", undefined, undefined, undefined, Date.now() - 10000, Date.now() + 10000, undefined, false, 1, 1, 1)];
        recent_bookings_controller.getRef().value = null;
        getStub.withArgs("/bookings", sinon.match.any).resolves({ data: { data: testDataPartial } });
        getStub.withArgs("/details", sinon.match.any).resolves({ data: { data: new StationDetailsModel(new StationModel(1, "Test", 1, "CPMS1", 0, 0, 0, 0, null, [new Socket(1, new SocketType("1", 10))], ""), []) } });
        await recent_bookings_controller.getUpcomingBookings();
        expect(recent_bookings_controller.getRef().value).to.be.eql(testDataComplete);
    });

    test("Should fetch no bookings if only in the past or too far in the future", async () => {
        recent_bookings_controller.getRef().value = null;
        getStub.withArgs("/bookings", sinon.match.any).resolves({ data: { data: [] } });
        getStub.withArgs("/details", sinon.match.any).resolves({ data: { data: new StationDetailsModel(new StationModel(1, "Test", 1, "CPMS1", 0, 0, 0, 0, null, [new Socket(1, new SocketType("1", 10))], ""), []) } });
        await recent_bookings_controller.getUpcomingBookings();
        expect(recent_bookings_controller.getRef().value).to.be.eql([]);
    });

    test("Should fetch no bookings in case of errors", async () => {
        recent_bookings_controller.getRef().value = null;
        getStub.withArgs("/bookings", sinon.match.any).resolves({ data: { data: null } });
        getStub.withArgs("/details", sinon.match.any).resolves({ data: { data: new StationDetailsModel(new StationModel(1, "Test", 1, "CPMS1", 0, 0, 0, 0, null, [new Socket(1, new SocketType("1", 10))], ""), []) } });
        await recent_bookings_controller.getUpcomingBookings();
        expect(recent_bookings_controller.getRef().value).to.be.eql(null);
    });

});