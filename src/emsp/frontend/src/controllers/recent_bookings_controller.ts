import { computed, ref, type Ref } from "vue";
import { GenericController } from "./generic_controller";
import type BookingModel from "@/model/booking_model";

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
            referenceDateMoth: month,
            referenceDateYear: year,
            intervalDays: 1
        };
        const res = await super.get<BookingModel[]>("/bookings", { query: body });
        this.setBookings(res);
        return res;
    }

    setBookings(bookings: BookingModel[] | null) {
        reference.value = bookings;
    }

    /**
     * Return the object reference of this controller. The controller is a singleton, so the reference is the same for all the class
     */
    getRef(): Ref<BookingModel[] | null> {
        return reference;
    }


}

export default new RecentBookingsController();