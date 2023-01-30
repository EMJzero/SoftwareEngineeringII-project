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
        <img class="rounded-md bg-no-repeat bg-cover bg-white aspect-video" style="object-fit: cover; margin-right: auto; margin-left: auto; max-width: 50%" :src="stationDetails?.imageURL" alt="Thumbnail">
        <p class="text-white text-3xl font-semibold pt-12 pb-3"> {{stationDetails?.name}} </p>
        <p class="text-white text-xl font-weight-regular py-2"> {{ stationDetails?.getAggregatedSocketSpeeds() }} Available </p>
        <p class="text-white text-xl font-weight-regular py-2"> Socket Types: {{ stationDetails?.getAggregatedSocketTypes() }} ({{ stationDetails?.sockets.length }} Total) </p>
        <div class="text-white font-semibold text-xl space-x-16 pt-20">
          <PrimaryButton text="Book a Charge" :onClick="() => router.push(RoutingPath.BOOKING)" />
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
  await station_details_controller.getStationDetails(route.query.cpms as string, parseInt(route.query.sid as string));
  isLoading.value = false;
});

const router = useRouter();
</script>

<style scoped>

</style>
