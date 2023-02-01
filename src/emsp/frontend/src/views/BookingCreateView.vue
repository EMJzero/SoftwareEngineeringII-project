<template>
  <div class="relative w-full items-center justify-center">
    <div class="text-center items-center justify-center justify-items-center pt-10">
      <p class="text-white font-semibold text-4xl pt-5 pb-3">Create a Booking - {{stationNameRef}} </p>
      <p class="text-white font-semibold text-2xl pt-2 pb-8">Choose a Socket and Time Slot </p>
      <p v-if="isLoading" class="text-grey font-semibold text-2xl space-x-16 pt-20">Loading Availability...</p>
    </div>
    <BookingCreateForm v-if="!isLoading" style="max-width: 80%; margin-left: auto; margin-right: auto"/>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import RoutingPath from "../router/routing_path";
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import ManageableBookingChip from "@/components/ManageableBookingChip.vue";
import BookingCreateForm from "@/components/BookingCreateForm.vue";
import * as forms from "@tailwindcss/forms";
import booking_create_controller from "@/controllers/booking_create_controller";

const dialog = ref(false);
const isLoading = ref(true);

const route = useRoute();

let stationNameRef = ref("STATION");

async function onClose(){
  dialog.value = false
}

// On Mounted page, collect the bookings data to display
onMounted(async () => {
  isLoading.value = true;
  const stationDetails = await booking_create_controller.getStationDetails(parseInt(route.query.cpms as string), parseInt(route.query.sid as string))
  stationNameRef.value = stationDetails?.stationData?.name ?? "UNOWN";
  isLoading.value = false;
});

const router = useRouter();
</script>

<style scoped>

</style>