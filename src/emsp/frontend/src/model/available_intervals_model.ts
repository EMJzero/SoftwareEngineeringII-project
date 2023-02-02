export default class AvailableIntervalsModel {
    date: Date;
    startHour: number;
    endHour: number;
    availableSocketID: number;

    constructor(date: Date, startHour: number, endHour: number, availableSocketID: number) {
        this.date = date;
        this.startHour = startHour;
        this.endHour = endHour;
        this.availableSocketID = availableSocketID;
    }

    toIdString(): string {
        return this.date.toString() + "_ST_" + this.startHour + "_ED_" + this.endHour;
    }

}