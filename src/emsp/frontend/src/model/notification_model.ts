export default class NotificationModel {
    notificationId: number;
    userId: number;
    content: string;
    generationDate: number;

    constructor(notificationId: number, userId: number, content: string, generationDate: number) {
        this.notificationId = notificationId;
        this.userId = userId;
        this.content = content;
        this.generationDate = generationDate;
    }
}