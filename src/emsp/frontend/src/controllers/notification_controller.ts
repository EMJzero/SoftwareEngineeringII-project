import { computed, ref, type Ref } from "vue";
import { GenericController } from "./generic_controller";
import type NotificationModel from "@/model/notification_model";

let reference = ref<NotificationModel[] | null>(null);

interface INotificationsController {
    getNotifications(): Promise<NotificationModel[] | null>;
    setNotifications(notifications: NotificationModel[] | null): void;
    clearNotifications(): Promise<void>;
    refreshNotifications(): Promise<void>;
}

class NotificationsController extends GenericController<NotificationModel[] | null> implements INotificationsController {

    async clearNotifications(): Promise<void> {
        const res = await super.delete("/cs-notification", { message: "Notifications cleared successfully!" });
        await this.setNotifications(null);
    }

    async getNotifications(): Promise<NotificationModel[] | null> {
        const res = await super.get<NotificationModel[]>("/cs-notification", {});
        await this.setNotifications(res);
        return res;
    }

    setNotifications(notifications: NotificationModel[] | null): void {
        reference.value = notifications;
    }

    async refreshNotifications(): Promise<void> {
        const res = await super.get<NotificationModel[]>("/cs-notification", { message: "Notifications refreshed!" });
        await this.setNotifications(res);
    }

    /**
     * Return the object reference of this controller. The controller is a singleton, so the reference is the same for all the class
     */
    getRef(): Ref<NotificationModel[] | null> {
        return reference;
    }

}

export default new NotificationsController();