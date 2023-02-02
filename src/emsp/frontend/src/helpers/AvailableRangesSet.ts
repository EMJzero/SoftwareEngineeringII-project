import type AvailableIntervalsModel from "@/model/available_intervals_model";

export default class AvailableRangesSet {

    private map: Map<string, AvailableIntervalsModel>;

    constructor(array: AvailableIntervalsModel[]) {
        const init: [string, AvailableIntervalsModel][] = array.map((item) => {
            return [item.toIdString(), item]
        });
        this.map = new Map<string, AvailableIntervalsModel>(init);
    }

    add(item: AvailableIntervalsModel) {
        this.map.set(item.toIdString(), item);
    }

    values() {
        return this.map.values();
    }

    delete(item: AvailableIntervalsModel) {
        return this.map.delete(item.toIdString());
    }

    // ...
}