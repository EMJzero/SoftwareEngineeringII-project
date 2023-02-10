import * as sinon from "sinon";
import {SinonStub} from "sinon";
import {expect, use} from "chai";
const sinonChai = require("sinon-chai");
import {afterEach, beforeEach, describe, test} from "vitest";
import axiosInstance from "../../src/helpers/axios_service";
import NotificationModel from "../../src/model/notification_model";
import notification_controller from "../../src/controllers/notification_controller";

use(sinonChai);
const sandbox = sinon.createSandbox();

describe("Notification Manager Tests", () => {
    let getStub: SinonStub;
    let deleteStub: SinonStub;

    beforeEach(() => {
        getStub = sandbox.stub(axiosInstance, "get");
        deleteStub = sandbox.stub(axiosInstance, "delete");
    });

    afterEach(() => {
        sandbox.restore();
    });

    test("Should correctly clear notifications", async () => {
        const testData = [new NotificationModel(1, 1, "Test", Date.now())];
        notification_controller.getRef().value = testData;
        deleteStub.resolves({ data: { data: true } });
        await notification_controller.clearNotifications();
        expect(notification_controller.getRef().value).to.be.eql(null);
    });

    test("Should correctly get notifications", async () => {
        const testData = [new NotificationModel(1, 1, "Test", Date.now())];
        notification_controller.getRef().value = null;
        getStub.resolves({ data: { data: testData } });
        await notification_controller.getNotifications();
        expect(notification_controller.getRef().value).to.be.eql(testData);
    });

    test("Should correctly refresh notifications", async () => {
        const testData = [new NotificationModel(1, 1, "Test", Date.now())];
        const testData2 = [new NotificationModel(1, 1, "Test", Date.now()), new NotificationModel(2, 1, "Test 2", Date.now() + 10)];
        notification_controller.getRef().value = null;
        getStub.resolves({ data: { data: testData2 } });
        await notification_controller.refreshNotifications();
        expect(notification_controller.getRef().value).to.be.eql(testData2);
    });

});