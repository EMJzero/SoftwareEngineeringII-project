import AvailableIntervalsModel from "@/model/available_intervals_model";

export default class StationAvailabilityModel {

    startDate: number;
    endDate: number;

    constructor(startDate: number, endDate: number) {
        this.startDate = startDate;
        this.endDate = endDate;
    }

    static convertToHourlyRanges(longRanges: StationAvailabilityModel[], referenceDate: Date): AvailableIntervalsModel[] {
        const result: AvailableIntervalsModel[] = [];
        const now = new Date();
        for (const longRange of longRanges) {
            //Split into hours
            const startDate = new Date(longRange.startDate);
            const endDate = new Date(longRange.endDate);
            for (let hr = 0; hr < 24; hr++) {
                const hrDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate(), hr);
                if (hrDate >= startDate && hrDate < endDate && hrDate >= now) {
                    result.push(new AvailableIntervalsModel(referenceDate, hr, hr + 1));
                }
            }
        }
        return result;
    }

}