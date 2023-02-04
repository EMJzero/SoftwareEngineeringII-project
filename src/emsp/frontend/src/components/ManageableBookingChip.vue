<template>
  <li class="bg-grey-darken-2 rounded-lg py-4 px-8 my-4 shadow-lg">
    <div class="flex flex-row">
      <div style="">
        <p class="text-left text-2xl font-bold text-white"> {{ booking.name }} </p>
        <p class="text-left text-sm font-weight-regular text-white"> {{ booking.socketSpeed }} </p>
        <p class="text-left text-sm font-weight-regular text-white">Socket: {{ booking.socketType }} </p>
        <p class="text-left text-sm font-weight-regular text-white pt-5">Starts: {{ getStartDate() }} </p>
        <p class="text-left text-sm font-weight-regular text-white">Ends: {{ getEndDate() }} </p>
      </div>
      <div style="max-width: 8rem; max-height: 60%; flex-basis: 8rem; margin-left: auto; margin-right: 0px">
        <img class="rounded-md bg-no-repeat bg-cover bg-white aspect-square" style="object-fit: cover" :src="booking.imageURL" alt="Thumbnail"> <!--:src="booking.imageURL"-->
      </div>
    </div>
    <div class="button-container pt-8 pb-2">
      <button class="text-left rounded-lg pt-2 pb-4 px-9 text-lg font-medium text-white">  </button>
      <button v-if="booking.isActive && isBookingLive()" class="rounded-lg py-2 px-9 text-lg font-medium text-white left-button" :class="{ 'bg-blue-600 hover:bg-blue-700': !booking.isWaiting, 'bg-grey hover:bg-grey-darken-1': booking.isWaiting }"
              @click="bookings_controller.stopChargeBooking(booking)">
        {{ booking.isWaiting ? "Connecting..." : 'Stop Charge' }}
      </button>
      <button v-if="!booking.isActive && isBookingLive()" class="rounded-lg py-2 px-9 text-lg font-medium text-white left-button" :class="{ 'bg-green-600 hover:bg-green-700': !booking.isWaiting, 'bg-grey hover:bg-grey-darken-1': booking.isWaiting }"
              @click="bookings_controller.startChargeBooking(booking)">
        {{ booking.isWaiting ? "Connecting..." : 'Start Charge' }}
      </button>
      <button v-if="isBookingFuture() && !booking.isActive" class="rounded-lg bg-red-600 py-2 px-9 text-lg font-medium text-white hover:bg-red-700 right-button"
              @click="bookings_controller.deleteBooking(booking)">
        Delete
      </button>
    </div>
  </li>
</template>

<script setup lang="ts">
import { defineProps, ref } from 'vue';
import ModalComponent from '@/components/ModalComponent.vue';
import type BookingModel from '@/model/booking_model';
import {reduceFullDateString} from "@/helpers/converters";
import PrimaryButton from "@/components/PrimaryButton.vue";
import bookings_controller from "@/controllers/bookings_controller";

const props = defineProps<{
  booking: BookingModel;
}>();

function getStartDate(): string {
  return reduceFullDateString(new Date(props.booking.startDate).toString());
}

function getEndDate(): string {
  return reduceFullDateString(new Date(props.booking.endDate).toString());
}

function isBookingLive(): boolean {
  const now = (new Date()).valueOf();
  return now < props.booking.endDate && now >= props.booking.startDate;
}

function isBookingFuture(): boolean {
  const now = (new Date()).valueOf();
  return now < props.booking.startDate;
}

</script>

<style scoped>

.button-container {

}
.left-button {
  float: left;
  margin-bottom: 0.8rem;
  text-align: left;
}
.right-button {
  float: right;
  text-align: right;
}
@media(max-width: 900px) {
  .button-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-items: center;
    place-items: center;
    max-width: 50%;
    margin-right: auto;
    margin-left: auto;
  }
  .left-button {
    float: none;
    text-align: center;
  }
  .right-button {
    float: none;
    text-align: center;
  }
}

</style>