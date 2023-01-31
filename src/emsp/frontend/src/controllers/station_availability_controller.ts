import { computed, ref, type Ref } from "vue";
import { GenericController } from "./generic_controller";
import type BookingModel from "@/model/booking_model";
import type StationModel from "@/model/station_model";
import type StationDetailsModel from "@/model/station_details_model";
import type Socket from "@/model/socket_model";
import {SocketType} from "@/model/socket_model";
import type AvailableIntervalsModel from "@/model/available_intervals_model";
import StationAvailabilityModel from "@/model/station_availability_model";

let reference = ref<AvailableIntervalsModel[] | null>(null);

export interface IStationAvailabilityController {
    getAvailableSlots(cpmsId: number, stationId: number, socketId: number, date: Date): Promise<AvailableIntervalsModel[] | null>;
    setAvailableSlots(slots: StationAvailabilityModel[] | null, referenceDate: Date): void;
    clear(): void;
}

class StationAvailabilityController extends GenericController<AvailableIntervalsModel[] | null> implements IStationAvailabilityController {

    async getAvailableSlots(cpmsId: number, stationId: number, socketId: number, date: Date): Promise<AvailableIntervalsModel[] | null> {
        const body = {
            stationID: stationId,
            socketID: socketId,
            cpmsID: cpmsId,
            referenceDateDay: date.getDay(),
            referenceDateMonth: date.getMonth(),
            referenceDateYear: date.getFullYear()
        };
        const res = await super.get<StationAvailabilityModel[]>("/cs-availability", { query: body });
        this.setAvailableSlots(res, date);
        return reference.value;
    }

    setAvailableSlots(slots: StationAvailabilityModel[] | null, referenceDate: Date) {
        if (slots) {
            console.log(referenceDate);
            const hourlySlots = StationAvailabilityModel.convertToHourlyRanges(slots, referenceDate);
            console.log(hourlySlots)
            if (reference.value) {
                const refSet = new Set(reference.value);
                for (const slot of hourlySlots) {
                    refSet.add(slot);
                }
                reference.value = Array.from(refSet.values()) as AvailableIntervalsModel[];
            } else {
                reference.value = hourlySlots;
            }
        }
    }

    clear() {
        reference.value = null;
    }

    /**
     * Return the object reference of this controller. The controller is a singleton, so the reference is the same for all the class
     */
    getRef(): Ref<AvailableIntervalsModel[] | null> {
        return reference;
    }
}

export default new StationAvailabilityController();