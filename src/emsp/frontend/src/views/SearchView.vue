<template>
  <div class="relative w-full items-center justify-center">
    <div class="text-center items-center justify-center justify-items-center header">
      <p class="text-white font-semibold text-4xl pt-5 pb-8">Station Search</p>
      <p v-if="isLoading" class="text-grey font-semibold text-2xl space-x-16 pt-20">Loading Stations...</p>
    </div>
    <div class="wrapper">
      <MapComponent></MapComponent>
      <div class="overlay rounded-lg">
        <p v-if="isLoading" class="text-grey-lighten-60 text-center font-semibold text-3xl space-x-16 pt-20">Loading Nearby Stations...</p>
        <div style="height: 100%; overflow: auto">
          <ul v-if="!isLoading && stations && stations.length > 0" class="list-none pl-4 text-stone-400 text-lg" style="margin-left: auto; margin-right: auto">
            <NearbyStationCell v-for="station in stations" :tag="station.id" :station="station" @click="router.push(RoutingPath.CSDETAILS + '?cpms=' + station.ownerCPMSId + '&sid=' + station.id)"/>
          </ul>
          <p v-if="!isLoading && (!stations || stations.length === 0)" class="text-grey-lighten-60 text-center font-semibold text-3xl space-x-16 pt-20">No Stations Nearby</p>
        </div>
      </div>
    </div>
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
import station_map_controller from "@/controllers/station_map_controller";
import NearbyStationCell from "@/components/NearbyStationCell.vue";

const dialog = ref(false);
const isLoading = ref(true);

const route = useRoute();

let stations = station_map_controller.getRef();

async function onClose() {
  dialog.value = false
}

// On Mounted page, collect the bookings data to display
onMounted(async () => {
  isLoading.value = true;
  await station_map_controller.getNearbyStations();
  isLoading.value = false;
});

const router = useRouter();
</script>

<style scoped>

.wrapper {
  position: relative;
  width: 80%;
  height: 80%;
  margin-left: auto;
  margin-right: auto
}

.overlay {
  position: absolute;
  top: 0;
  right: 0;
  width: 40%;
  height: 100%;
  background-color: rgba(23, 23, 23, 0.5);
  backdrop-filter: blur(10px);
  max-width: 500px;
}

.header {
  padding-top: 2.5rem;
 }

@media(max-width: 800px) {
  .overlay {
    max-width: 100%;
    top: auto;
    bottom: 0;
    width: 100%;
    height: 35%;
  }
  .header {
    padding-top: 0px;
  }
  .wrapper {
    width: 95%;
  }
}

</style>