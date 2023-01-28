import { computed, ref, type Ref } from "vue";
import { GenericController } from "./generic_controller";
import type BookingModel from "@/model/booking_model";

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
        this.setBookings(res);
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

    setBookings(bookings: BookingModel[] | null) {
        reference.value = [{
            id: "1",
            name: "Tokyo Tower Hub",
            socketSpeed: "Ultra Fast",
            socketType: "Type A",
            startDate: "2023-30-01T22:13:00",
            endDate: "2023-31-01T23:13:00",
            imageURL: "https://www.japan-guide.com/g18/3003_01.jpg",
            isActive: false
        }];
    }

    /**
     * Return the object reference of this controller. The controller is a singleton, so the reference is the same for all the class
     */
    getRef(): Ref<BookingModel[] | null> {
        return reference;
    }
}

export default new BookingsController();