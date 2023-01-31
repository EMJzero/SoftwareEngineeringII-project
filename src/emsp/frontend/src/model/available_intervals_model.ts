export default class AvailableIntervalsModel {
    date: Date;
    startHour: number;
    endHour: number;

    constructor(date: Date, startHour: number, endHour: number) {
        this.date = date;
        this.startHour = startHour;
        this.endHour = endHour;
    }

}