export default class BookingModel {
    id: string;
    name: string;
    socketSpeed: string;
    socketType: string;
    startDate: string;
    endDate: string;
    imageURL: string;
    isActive: boolean;
    cpmsId: number;
    csId: number;
    socketId: number;

    constructor(id: string, name: string, socketSpeed: string, socketType: string, startDate: string, endDate: string, imageURL: string, isActive: boolean, cpmsId: number, csId: number, socketId: number) {
        this.id = id;
        this.name = name;
        this.socketSpeed = socketSpeed;
        this.socketType = socketType;
        this.startDate = startDate;
        this.endDate = endDate;
        this.imageURL = imageURL;
        this.isActive = isActive;
        this.cpmsId = cpmsId;
        this.csId = csId;
        this.socketId = socketId;
    }
}
