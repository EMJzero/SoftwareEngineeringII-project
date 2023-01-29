<template>
  <div class="relative w-full items-center justify-center">
    <div class="text-center items-center justify-center justify-items-center pt-10">
      <p class="text-white font-semibold text-4xl pt-5 pb-8">Station Search</p>
      <p v-if="isLoading" class="text-grey font-semibold text-2xl space-x-16 pt-20">Loading Stations...</p>
    </div>
    <MapComponent style="width: 80%; height: 80%; margin-left: auto; margin-right: auto"></MapComponent>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import RoutingPath from "../router/routing_path";
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import bookings_controller from "@/controllers/bookings_controller";
import ManageableBookingChip from "@/components/ManageableBookingChip.vue";
import MapComponent from "@/components/MapComponent.vue";

const dialog = ref(false);
const isLoading = ref(true);

const route = useRoute();

let bookings = bookings_controller.getRef();

async function onClose(){
  dialog.value = false
}

// On Mounted page, collect the bookings data to display
onMounted(async () => {
  isLoading.value = true;
  await bookings_controller.getBookings();
  isLoading.value = false;
});

const router = useRouter();
</script>

<style scoped>

</style>