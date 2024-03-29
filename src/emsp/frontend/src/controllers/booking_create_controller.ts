import { computed, ref, type Ref } from "vue";
import { GenericController } from "./generic_controller";
import type BookingModel from "@/model/booking_model";
import type StationModel from "@/model/station_model";
import type StationDetailsModel from "@/model/station_details_model";
import type Socket from "@/model/socket_model";
import {SocketType} from "@/model/socket_model";
import station_availability_controller from "@/controllers/station_availability_controller";
import type AvailableIntervalsModel from "@/model/available_intervals_model";
import {useToast} from "vue-toastification";

let reference = ref<StationDetailsModel | null>(null);

export interface IBookingCreateController {
    getStationDetails(cpmsId: number, stationId: number): Promise<StationDetailsModel | null>;
    setStationDetails(details: StationDetailsModel | null): void;
    createBooking(connector: string, powerTier: string, day: Date, timeSlot: AvailableIntervalsModel): Promise<boolean>;
}

class BookingCreateController extends GenericController<StationDetailsModel | null> implements IBookingCreateController {

    async getStationDetails(cpmsId: number, stationId: number): Promise<StationDetailsModel | null> {
        const res = await super.get<StationDetailsModel>("/details", { query: {
                cpmsId: cpmsId, stationID: stationId
            } });
        this.setStationDetails(res);
        return res;
    }

    async getStationAvailability(connector: string, powerTier: string, day: Date): Promise<AvailableIntervalsModel[] | null> {
        //Find all stations that match the connector and power tier specs
        if (reference.value) {
            const matchingSockets = reference.value.stationData.sockets?.filter((socket) => socket.type.connector === connector && SocketType.getChargeSpeed(socket.type) === powerTier)
            if (matchingSockets) {
                station_availability_controller.clear();
                for (const socket of matchingSockets) {
                    await station_availability_controller.getAvailableSlots(reference.value.stationData.ownerCPMSId, reference.value.stationData.id, socket.id, day);
                }
                return station_availability_controller.getRef().value;
            }
        }
        return null;
    }

    setStationDetails(details: StationDetailsModel | null) {
        reference.value = details;
    }

    async createBooking(connector: string, powerTier: string, day: Date, timeSlot: AvailableIntervalsModel): Promise<boolean> {
        if (!connector || !powerTier || !day || !timeSlot) {
            useToast().error("Cannot create a booking with missing parameters!");
            return false;
        }

        //Split the time slot string into start and end hours
        const startHr = timeSlot.startHour;
        const endHr = timeSlot.endHour;

        //Compute the start and end unix time
        const startDate = new Date(day.getFullYear(), day.getMonth(), day.getDate(), startHr);
        //const tomorrow = new Date(day.getDate() + 1);
        const endDate = new Date(day.getFullYear(), day.getMonth(), day.getDate(), endHr);//endHr < 24 ? new Date(day.getFullYear(), day.getMonth(), day.getDate(), endHr) : new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 0);
        const body = {
            startUnixTime: startDate.getTime(),
            endUnixTime: endDate.getTime(),
            cpmsID: reference.value?.stationData.ownerCPMSId,
            csID: reference.value?.stationData.id,
            socketID: reference.value?.stationData.sockets?.find((socket) => socket.type.connector == connector && SocketType.getChargeSpeed(socket.type) == powerTier && socket.id == timeSlot.availableSocketID)?.id
        }
        const res = await super.post<StationDetailsModel>("/bookings", { body, message: "Booking created successfully!" });
        if (res) {
            this.setStationDetails(res);
            return true;
        }
        return false;
    }

    /**
     * Return the object reference of this controller. The controller is a singleton, so the reference is the same for all the class
     */
    getRef(): Ref<StationDetailsModel | null> {
        return reference;
    }
}

export default new BookingCreateController();