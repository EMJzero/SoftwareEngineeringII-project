export default class BookingModel {
    id: string;
    name: string;
    socketSpeed: string;
    socketType: string;
    startDate: string;
    endDate: string;
    imageURL: string;
    isActive: boolean;

    constructor(id: string, name: string, socketSpeed: string, socketType: string, startDate: string, endDate: string, imageURL: string, isActive: boolean) {
        this.id = id;
        this.name = name;
        this.socketSpeed = socketSpeed;
        this.socketType = socketType;
        this.startDate = startDate;
        this.endDate = endDate;
        this.imageURL = imageURL;
        this.isActive = isActive;
    }
}
