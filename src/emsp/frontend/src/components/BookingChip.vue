<template>
  <li class="bg-grey-darken-2 rounded-lg py-4 px-8 shadow-lg">
    <div style="max-width: 8rem; max-height: 60%; float: right">
      <img class="rounded-md bg-no-repeat bg-cover bg-white aspect-square" style="object-fit: cover" :src="booking.imageURL" alt="Thumbnail">
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
import {reduceFullDateString} from "@/helpers/converters";

const props = defineProps<{
  booking: BookingModel;
}>();

function getStartDate(): string {
  return reduceFullDateString(new Date(props.booking.startDate).toString());
}

function getEndDate(): string {
  return reduceFullDateString(new Date(props.booking.endDate).toString());
}

</script>

<style scoped>

</style>