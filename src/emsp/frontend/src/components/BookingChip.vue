<template>
  <li class="bg-grey-darken-2 rounded-lg py-4 px-8 shadow-lg">
    <div style="max-width: 8rem; max-height: 100%; float: right">
      <img class="rounded-md bg-no-repeat bg-cover bg-white aspect-square" style="object-fit: cover" src="https://www.japan-guide.com/g18/3003_01.jpg" alt="Thumbnail"> <!--:src="booking.imageURL"-->
    </div>
    <div style="">
      <p class="text-left text-2xl font-bold text-white"> {{ booking.name }} </p>
      <p class="text-left text-sm font-weight-regular text-white"> {{ booking.socketSpeed }} </p>
      <p class="text-left text-sm font-weight-regular text-white">Socket: {{ booking.socketType }} </p>
      <p class="text-left text-sm font-weight-regular text-white pt-5">Starts: {{ getStartDate() }} </p>
      <p class="text-left text-sm font-weight-regular text-white">Ends: {{ getEndDate() }} </p>
    </div>
  </li>
</template>

<script setup lang="ts">
import { defineProps, ref } from 'vue';
import ModalComponent from '@/components/ModalComponent.vue';
import type BookingModel from '@/model/booking_model';
import {convertSQLStringToDateTimeString} from "@/helpers/converters";

const props = defineProps<{
  booking: BookingModel;
}>();

function getStartDate(): string {
  return convertSQLStringToDateTimeString(props.booking.startDate);
}

function getEndDate(): string {
  return convertSQLStringToDateTimeString(props.booking.endDate);
}

</script>

<style scoped>

</style>