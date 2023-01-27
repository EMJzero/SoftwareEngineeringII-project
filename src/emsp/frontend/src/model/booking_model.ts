export default class BookingModel {
    id: string;
    name: string;
    socketSpeed: string;
    socketType: string;
    startDate: string;
    endDate: string;

    constructor(id: string, name: string, socketSpeed: string, socketType: string, startDate: string, endDate: string) {
        this.id = id;
        this.name = name;
        this.socketSpeed = socketSpeed;
        this.socketType = socketType;
        this.startDate = startDate;
        this.endDate = endDate;
    }
}
