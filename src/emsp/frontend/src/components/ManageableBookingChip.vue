<template>
  <li class="bg-grey-darken-2 rounded-lg py-4 px-8 shadow-lg">
    <div style="max-width: 8rem; max-height: 60%; float: right">
      <img class="rounded-md bg-no-repeat bg-cover bg-white aspect-square" style="object-fit: cover" src="https://www.japan-guide.com/g18/3003_01.jpg" alt="Thumbnail"> <!--:src="booking.imageURL"-->
    </div>
    <div style="">
      <p class="text-left text-2xl font-bold text-white"> {{ booking.name }} </p>
      <p class="text-left text-sm font-weight-regular text-white"> {{ booking.socketSpeed }} </p>
      <p class="text-left text-sm font-weight-regular text-white">Socket: {{ booking.socketType }} </p>
      <p class="text-left text-sm font-weight-regular text-white pt-5">Starts: {{ getStartDate() }} </p>
      <p class="text-left text-sm font-weight-regular text-white">Ends: {{ getEndDate() }} </p>
      <div class="pt-8 pb-2">
        <button class="text-left rounded-lg pt-2 pb-4 px-9 text-lg font-medium text-white">  </button>
        <button v-if="booking.isActive && isBookingLive()" class="text-left rounded-lg bg-blue-600 py-2 px-9 text-lg font-medium text-white hover:bg-blue-700"
                @click="bookings_controller.stopChargeBooking(booking)">
          Stop Charge
        </button>
        <button v-if="!booking.isActive && isBookingLive()" class="text-left rounded-lg bg-green-600 py-2 px-9 text-lg font-medium text-white hover:bg-green-700" style="float: left"
                @click="bookings_controller.startChargeBooking(booking)">
          Start Charge
        </button>
        <button v-if="(new Date()).toISOString() < (new Date(getStartDate())).toISOString()" class="text-right rounded-lg bg-red-600 py-2 px-9 text-lg font-medium text-white hover:bg-red-700" style="float: right"
                @click="bookings_controller.deleteBooking(booking)">
          Delete
        </button>
      </div>
    </div>
  </li>
</template>

<script setup lang="ts">
import { defineProps, ref } from 'vue';
import ModalComponent from '@/components/ModalComponent.vue';
import type BookingModel from '@/model/booking_model';
import {convertSQLStringToDateTimeString} from "@/helpers/converters";
import PrimaryButton from "@/components/PrimaryButton.vue";
import bookings_controller from "@/controllers/bookings_controller";

const props = defineProps<{
  booking: BookingModel;
}>();

function getStartDate(): string {
  return convertSQLStringToDateTimeString(props.booking.startDate);
}

function getEndDate(): string {
  return convertSQLStringToDateTimeString(props.booking.endDate);
}

function isBookingLive(): boolean {
  return (new Date()).toISOString() < (new Date(getEndDate())).toISOString() && (new Date()).toISOString() >= (new Date(getStartDate())).toISOString()
}

</script>

<style scoped>

</style>