import * as sinon from "sinon";
import {SinonStub} from "sinon";
import {expect, use} from "chai";
const sinonChai = require("sinon-chai");
import {afterEach, beforeEach, describe, test} from "vitest";
import axiosInstance from "../../src/helpers/axios_service";
import {UserModel} from "../../src/model/user_model";
import BookingModel from "../../src/model/booking_model";
import bookings_controller from "../../src/controllers/bookings_controller";
import StationDetailsModel from "../../src/model/station_details_model";
import StationModel from "../../src/model/station_model";
import Socket, {SocketType} from "../../src/model/socket_model";

use(sinonChai);
const sandbox = sinon.createSandbox();

describe("Booking Manager Tests", () => {
    let getStub: SinonStub;
    let postStub: SinonStub;
    let deleteStub: SinonStub;
    let userTest: UserModel = new UserModel("test", "email@email.it");

    beforeEach(() => {
        getStub = sandbox.stub(axiosInstance, "get");
        postStub = sandbox.stub(axiosInstance, "post");
        deleteStub = sandbox.stub(axiosInstance, "delete");
    });

    afterEach(() => {
        sandbox.restore();
    });

    test("Should correctly fetch bookings", async () => {
        const testData = [new BookingModel("1", "Test", "Fast", "1", Date.now(), Date.now() + 1, "", false, 1, 1, 1)];
        getStub.withArgs("/bookings", sinon.match.any).resolves({ data: { data: testData } });
        getStub.withArgs("/details", sinon.match.any).resolves({ data: { data: new StationDetailsModel(new StationModel(1, "Test", 1, "CPMS1", 0, 0, 0, 0, null, [new Socket(1, new SocketType("1", 10))], ""), []) } });
        await bookings_controller.getBookings();
        expect(bookings_controller.getRef().value).to.be.eql(testData);
    });

    test("Should correctly delete bookings", async () => {
        const testData = [new BookingModel("1", "Test", "Fast", "1", Date.now() + 100, Date.now() + 200, "", false, 1, 1, 1)];
        bookings_controller.getRef().value = testData;
        deleteStub.resolves({ data: { data: true } });
        expect(await bookings_controller.deleteBooking(testData[0])).to.be.true;
        expect(bookings_controller.getRef().value).to.be.eql([]);
    });

    test("Should not delete bookings in case of failure", async () => {
        const testData = [new BookingModel("1", "Test", "Fast", "1", Date.now(), Date.now() + 1, "", false, 1, 1, 1)];
        bookings_controller.getRef().value = testData;
        deleteStub.resolves({ data: { data: false } });
        expect(await bookings_controller.deleteBooking(testData[0])).to.be.false;
        expect(bookings_controller.getRef().value).to.be.eql(testData);
    });

    test("Should not delete a current booking", async () => {
        const testData = [new BookingModel("1", "Test", "Fast", "1", Date.now() - 10000, Date.now() + 10000, "", false, 1, 1, 1)];
        bookings_controller.getRef().value = testData;
        deleteStub.resolves({ data: { data: false } });
        expect(await bookings_controller.deleteBooking(testData[0])).to.be.false;
        expect(bookings_controller.getRef().value).to.be.eql(testData);
    });

    test("Should not delete an active booking", async () => {
        const testData = [new BookingModel("1", "Test", "Fast", "1", Date.now() - 10000, Date.now() + 10000, "", true, 1, 1, 1)];
        bookings_controller.getRef().value = testData;
        deleteStub.resolves({ data: { data: false } });
        expect(await bookings_controller.deleteBooking(testData[0])).to.be.false;
        expect(bookings_controller.getRef().value).to.be.eql(testData);
    });

    test("Should correctly start a charge for a current booking", async () => {
        const testData = [new BookingModel("1", "Test", "Fast", "1", Date.now() - 10000, Date.now() + 10000, "", false, 1, 1, 1)];
        bookings_controller.getRef().value = testData;
        postStub.resolves({ data: { data: testData[0] } });
        expect(await bookings_controller.startChargeBooking(testData[0])).to.be.true;
        expect(bookings_controller.getRef().value).to.be.eql(testData);
    });

    test("Should not start a charge for a past booking", async () => {
        const testData = [new BookingModel("1", "Test", "Fast", "1", Date.now() - 10000, Date.now() - 5000, "", false, 1, 1, 1)];
        bookings_controller.getRef().value = testData;
        postStub.resolves({ data: { data: null } });
        expect(await bookings_controller.startChargeBooking(testData[0])).to.be.false;
        expect(bookings_controller.getRef().value).to.be.eql(testData);
    });

    test("Should not start a charge for a future booking", async () => {
        const testData = [new BookingModel("1", "Test", "Fast", "1", Date.now() + 10000, Date.now() + 20000, "", false, 1, 1, 1)];
        bookings_controller.getRef().value = testData;
        postStub.resolves({ data: { data: null } });
        expect(await bookings_controller.startChargeBooking(testData[0])).to.be.false;
        expect(bookings_controller.getRef().value).to.be.eql(testData);
    });

    test("Should not start a charge for an active booking", async () => {
        const testData = [new BookingModel("1", "Test", "Fast", "1", Date.now() - 10000, Date.now() + 10000, "", true, 1, 1, 1)];
        bookings_controller.getRef().value = testData;
        postStub.resolves({ data: { data: null } });
        expect(await bookings_controller.startChargeBooking(testData[0])).to.be.false;
        expect(bookings_controller.getRef().value).to.be.eql(testData);
    });

    test("Should correctly stop a charge for a current booking", async () => {
        const testData = [new BookingModel("1", "Test", "Fast", "1", Date.now() - 10000, Date.now() + 10000, "", true, 1, 1, 1)];
        bookings_controller.getRef().value = testData;
        postStub.resolves({ data: { data: testData[0] } });
        expect(await bookings_controller.stopChargeBooking(testData[0])).to.be.true;
        expect(bookings_controller.getRef().value).to.be.eql(testData);
    });

    test("Should not stop a charge for a past booking", async () => {
        const testData = [new BookingModel("1", "Test", "Fast", "1", Date.now() - 10000, Date.now() - 5000, "", false, 1, 1, 1)];
        bookings_controller.getRef().value = testData;
        postStub.resolves({ data: { data: null } });
        expect(await bookings_controller.stopChargeBooking(testData[0])).to.be.false;
        expect(bookings_controller.getRef().value).to.be.eql(testData);
    });

    test("Should not stop a charge for a future booking", async () => {
        const testData = [new BookingModel("1", "Test", "Fast", "1", Date.now() + 10000, Date.now() + 20000, "", false, 1, 1, 1)];
        bookings_controller.getRef().value = testData;
        postStub.resolves({ data: { data: null } });
        expect(await bookings_controller.stopChargeBooking(testData[0])).to.be.false;
        expect(bookings_controller.getRef().value).to.be.eql(testData);
    });

    test("Should not stop a charge for an inactive booking", async () => {
        const testData = [new BookingModel("1", "Test", "Fast", "1", Date.now() - 10000, Date.now() + 10000, "", false, 1, 1, 1)];
        bookings_controller.getRef().value = testData;
        postStub.resolves({ data: { data: null } });
        expect(await bookings_controller.stopChargeBooking(testData[0])).to.be.false;
        expect(bookings_controller.getRef().value).to.be.eql(testData);
    });

    test("Should correctly fetch bookings data when setting", async () => {
        const testDataComplete = [new BookingModel("1", "Test", "Fast", "1", Date.now() - 10000, Date.now() + 10000, "", false, 1, 1, 1)];
        const testDataPartial = [new BookingModel("1", undefined, undefined, undefined, Date.now() - 10000, Date.now() + 10000, undefined, false, 1, 1, 1)];
        bookings_controller.getRef().value = testDataPartial;
        getStub.withArgs("/bookings", sinon.match.any).resolves({ data: { data: testDataComplete } });
        getStub.withArgs("/details", sinon.match.any).resolves({ data: { data: new StationDetailsModel(new StationModel(1, "Test", 1, "CPMS1", 0, 0, 0, 0, null, [new Socket(1, new SocketType("1", 10))], ""), []) } });
        await bookings_controller.setBookings(testDataPartial);
        expect(bookings_controller.getRef().value).to.be.eql(testDataComplete);
    });

    test("Should partially complete booking data with failures", async () => {
        const testDataComplete = [new BookingModel("1", "", "Unknown", "Unown", Date.now() - 10000, Date.now() + 10000, "", false, 1, 1, 1)];
        const testDataPartial = [new BookingModel("1", undefined, undefined, undefined, Date.now() - 10000, Date.now() + 10000, undefined, false, 1, 1, 1)];
        bookings_controller.getRef().value = testDataPartial;
        getStub.resolves({ data: { data: null } });
        await bookings_controller.setBookings(testDataPartial);
        expect(bookings_controller.getRef().value).to.be.eql(testDataComplete);
    });

    test("Should not fetch additional data with null bookings", async () => {
        bookings_controller.getRef().value = [new BookingModel("1", undefined, undefined, undefined, Date.now() - 10000, Date.now() + 10000, undefined, false, 1, 1, 1)];
        await bookings_controller.setBookings(null);
        expect(bookings_controller.getRef().value).to.be.eql(null);
    });

});