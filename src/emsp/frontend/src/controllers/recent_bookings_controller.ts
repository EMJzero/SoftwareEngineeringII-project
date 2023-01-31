import { computed, ref, type Ref } from "vue";
import { GenericController } from "./generic_controller";
import type BookingModel from "@/model/booking_model";
import type StationDetailsModel from "@/model/station_details_model";
import type Socket from "@/model/socket_model";
import {SocketType} from "@/model/socket_model";

let reference = ref<BookingModel[] | null>(null);

interface IRecentBookingsController {
    getUpcomingBookings(): Promise<BookingModel[] | null>;
    setBookings(bookings: BookingModel[] | null): void;
}

class RecentBookingsController extends GenericController<BookingModel[] | null> implements IRecentBookingsController {

    async getUpcomingBookings(): Promise<BookingModel[] | null> {
        const now = new Date();
        const month = now.getUTCMonth() + 1; //months from 1-12
        const day = now.getUTCDate();
        const year = now.getUTCFullYear();
        const body = {
            referenceDateDay: day,
            referenceDateMonth: month,
            referenceDateYear: year,
            intervalDays: 1
        };
        const res = await super.get<BookingModel[]>("/bookings", { query: body });
        console.log(res);
        await this.setBookings(res);
        return res;
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
            for (let i = 0; i < result.length; i++) {
                if (result[i].csId == cpmsAndCs[1] && result[i].cpmsId == cpmsAndCs[0]) {
                    result[i].imageURL = res?.stationData.imageURL ?? "";
                    result[i].name = res?.stationData.name ?? "";
                    const socket = res?.stationData.sockets?.find((socket) => socket.id == result[i].socketId) as Socket
                    if (socket) {
                        result[i].socketSpeed = SocketType.getChargeSpeed(socket.type);
                        result[i].socketType = socket.type.connector;
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

export default new RecentBookingsController();