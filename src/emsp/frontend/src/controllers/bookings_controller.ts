import { computed, ref, type Ref } from "vue";
import { GenericController } from "./generic_controller";
import type BookingModel from "@/model/booking_model";
import type StationModel from "@/model/station_model";
import type StationDetailsModel from "@/model/station_details_model";
import type Socket from "@/model/socket_model";
import {SocketType} from "@/model/socket_model";

let reference = ref<BookingModel[] | null>(null);

export interface IBookingsController {
    getBookings(): Promise<BookingModel[] | null>;
    deleteBooking(booking: BookingModel): Promise<boolean>;
    startChargeBooking(booking: BookingModel): Promise<boolean>;
    stopChargeBooking(booking: BookingModel): Promise<boolean>;
    setBookings(bookings: BookingModel[] | null): void;
}

class BookingsController extends GenericController<BookingModel[] | null> implements IBookingsController {

    async deleteBooking(booking: BookingModel): Promise<boolean> {
        const res = await super.delete("/bookings", { body: {
            bookingId: booking.id
            } });
        if (res) {
            reference.value = reference.value?.filter((b) => b.id != booking.id) ?? null;
        }
        return res;
    }

    async getBookings(): Promise<BookingModel[] | null> {
        const res = await super.get<BookingModel[]>("/bookings");
        await this.setBookings(res);
        return res;
    }

    async startChargeBooking(booking: BookingModel): Promise<boolean> {
        const res = await super.post<BookingModel>("/recharge-manager", { body: {
            booking, command: "START"
            } });
        if (res) {
            const idx = reference.value?.findIndex((bookingA) => bookingA.id == booking.id);
            if (idx) {
                const values = reference.value;
                if (values) {
                    (values as BookingModel[])[idx] = res;
                    reference.value = values;
                    return true;
                }
            }
        }
        return false;
    }

    async stopChargeBooking(booking: BookingModel): Promise<boolean> {
        const res = await super.post<BookingModel>("/recharge-manager", { body: {
                booking, command: "STOP"
            } });
        if (res) {
            const idx = reference.value?.findIndex((bookingA) => bookingA.id == booking.id);
            if (idx) {
                const values = reference.value;
                if (values) {
                    (values as BookingModel[])[idx] = res;
                    reference.value = values;
                    return true;
                }
            }
        }
        return false;
    }

    async setBookings(bookings: BookingModel[] | null) {
        //For each booking ask the details of the CSes and complete the booking data
        if (bookings) {
            reference.value = await this.getStationDetails(bookings);
        } else {
            reference.value = bookings;
        }
    }

    async getStationDetails(bookings: BookingModel[]): Promise<BookingModel[]> {
        let result = bookings;
        let cpmsIDsAndStationIDs = new Set<[number, number]>();
        for (const booking of bookings) {
            cpmsIDsAndStationIDs.add([booking.cpmsId, booking.csId]);
        }
        for (const cpmsAndCs of cpmsIDsAndStationIDs) {
            const res = await super.get<StationDetailsModel>("/details", { query: {
                    cpmsId: cpmsAndCs[0], stationID: cpmsAndCs[1]
                } });
            console.log(res);
            for (let i = 0; i < result.length; i++) {
                if (result[i].csId == cpmsAndCs[1] && result[i].cpmsId == cpmsAndCs[0]) {
                    result[i].imageURL = res?.stationData.imageURL ?? "";
                    result[i].name = res?.stationData.name ?? "";
                    const socketType = (res?.stationData.sockets?.find((socket) => socket.id == result[i].socketId) as Socket)?.type
                    if (socketType) {
                        result[i].socketSpeed = SocketType.getChargeSpeed(socketType);
                        result[i].socketType = socketType.connector;
                    } else {
                        result[i].socketSpeed = "Unknown";
                        result[i].socketType = "Unown";
                    }
                }
            }
        }
        return result;
    }

    /**
     * Return the object reference of this controller. The controller is a singleton, so the reference is the same for all the class
     */
    getRef(): Ref<BookingModel[] | null> {
        return reference;
    }
}

export default new BookingsController();