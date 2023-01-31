<template>
  <li class="bg-grey-darken-2 rounded-lg py-4 px-8 shadow-lg my-3 mx-3 cursor-pointer" style="min-height: 8rem">
    <div style="max-width: 6rem; float: right">
      <img class="rounded-md bg-no-repeat bg-cover bg-white aspect-square" style="object-fit: cover" :src="station.imageURL" alt="Thumbnail">
    </div>
    <div style="">
      <p class="text-left text-xl font-bold text-light-blue-accent-1" style="text-decoration: none"> {{ station.name ?? "No Name" }} </p>
      <p class="text-left text-sm font-weight-regular text-white">  </p>
      <p class="text-left text-sm font-weight-regular text-white pt-5">Price: {{ station.userPrice }} €/Wh </p>
      <p v-if="station.offerExpirationDate != null" class="text-left text-sm font-weight-regular text-white">Offer ends: {{ getEndDate() }} </p>
      <p v-if="station.offerExpirationDate == null" class="text-left text-sm font-weight-regular text-white">No Offer Available </p>
    </div>
  </li>
</template>

<script setup lang="ts">
import { defineProps, ref } from 'vue';
import ModalComponent from '@/components/ModalComponent.vue';
import type BookingModel from '@/model/booking_model';
import {convertSQLStringToDateTimeString} from "@/helpers/converters";
import type StationModel from "@/model/station_model";
import station_map_controller from "@/controllers/station_map_controller";

const props = defineProps<{
  station: StationModel;
}>();

function getEndDate(): string {
  return props.station.offerExpirationDate ? convertSQLStringToDateTimeString(props.station.offerExpirationDate) : "No Date";
}

</script>

<style scoped>

</style>