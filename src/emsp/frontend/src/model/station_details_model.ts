import type StationModel from "@/model/station_model";

export default class StationDetailsModel {

    stationData: StationModel;
    availableTimeSlots: DateIntervalPerSocket[];

    constructor(stationData: StationModel, availableTimeSlots: DateIntervalPerSocket[]) {
        this.stationData = stationData;
        this.availableTimeSlots = availableTimeSlots;
    }

}

export class DateIntervalPerSocket {
    readonly startDate: Date;
    readonly endDate: Date;
    readonly socketId: number;

    constructor(startDate: Date, endDate: Date, socketId: number) {
        this.startDate = startDate;
        this.endDate = endDate;
        this.socketId = socketId;
    }
}