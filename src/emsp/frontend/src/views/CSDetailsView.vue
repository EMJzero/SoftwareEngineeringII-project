<template>
  <div class="relative w-full items-center justify-center">
    <div class="text-center text-white pt-5">
      <p class="font-semibold text-4xl">
        Station Details
      </p>
    </div>

    <div class="text-center items-center justify-center justify-items-center pt-10">
      <p v-if="isLoading" class="text-grey font-semibold text-2xl space-x-16 pt-20">Loading Station Details...</p>
      <div v-if="!isLoading && stationDetails">
        <img class="rounded-md bg-no-repeat bg-cover bg-white" style="object-fit: cover; margin-right: auto; margin-left: auto; max-height: 30rem; max-width: 50%; aspect-ratio: 4 / 3" :src="stationDetails?.stationData.imageURL" alt="Thumbnail">
        <p class="text-white text-3xl font-semibold pt-12 pb-3"> {{stationDetails?.stationData.name}} </p>
        <p class="text-white text-xl font-weight-regular py-2"> {{ getAggregatedSocketSpeeds() }} Available </p>
        <p class="text-white text-xl font-weight-regular py-2"> Socket Types: {{ getAggregatedSocketTypes() }} ({{ (stationDetails?.stationData.sockets ?? []).length }} Total) </p>
        <p v-if="stationDetails?.stationData.offerExpirationDate" class="text-white text-xl font-weight-regular py-2"> Offers Available Until:
          {{ getOfferEndDate() }} </p>
        <p v-if="!stationDetails?.stationData.offerExpirationDate" class="text-white text-xl font-weight-regular py-2"> No Offers Available </p>
        <div class="text-white font-semibold text-xl space-x-16 pt-10">
          <PrimaryButton text="Book a Charge" :onClick="() => router.push(RoutingPath.BOOKING + '?cpms=' + station_details_controller.getRef().value.stationData.ownerCPMSId + '&sid=' + station_details_controller.getRef().value.stationData.id)" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import RoutingPath from "../router/routing_path";
import OutilinedButton from "../components/OutlinedButton.vue";
import PrimaryButton from "@/components/PrimaryButton.vue";
import auth_controller from "@/controllers/authorization_controller";
import BookingChip from "@/components/BookingChip.vue";
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import station_details_controller from "@/controllers/station_details_controller";
import {convertSQLStringToDateTimeString} from "@/helpers/converters";
import {SocketType} from "@/model/socket_model";

const dialog = ref(false);
const isLoading = ref(true);

const route = useRoute();

let stationDetails = station_details_controller.getRef();

async function onClose(){
  dialog.value = false
}

// On Mounted page, collect the bookings data to display
onMounted(async () => {
  isLoading.value = true;
  await station_details_controller.getStationDetails(parseInt(route.query.cpms as string), parseInt(route.query.sid as string));
  isLoading.value = false;
});

function getAggregatedSocketSpeeds(): string {
  let speeds = "";
  let set: Set<string> = new Set<string>();
  for (const socket of stationDetails.value?.stationData.sockets ?? []) {
    set.add(SocketType.getChargeSpeed(socket.type));
  }
  for (const speed of set) {
    if (speeds == "") {
      speeds += speed;
    } else {
      speeds += ", " + speed;
    }
  }
  return speeds;
}

function getAggregatedSocketTypes(): string {
  let types = "";
  let set: Set<string> = new Set<string>();
  for (const socket of stationDetails.value?.stationData.sockets ?? []) {
    set.add(socket.type.connector);
  }
  for (const connector of set) {
    if (types == "") {
      types += connector;
    } else {
      types += ", " + connector;
    }
  }
  return types;
}

function getOfferEndDate(): string {
  if (stationDetails.value?.stationData.offerExpirationDate) {
    return convertSQLStringToDateTimeString(stationDetails.value?.stationData.offerExpirationDate);
  }
  return "No Offers";
}

const router = useRouter();
</script>

<style scoped>

</style>
