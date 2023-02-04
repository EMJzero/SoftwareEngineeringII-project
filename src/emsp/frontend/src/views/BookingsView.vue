<template>
  <div class="relative w-full items-center justify-center">
    <div class="list-container text-center items-center justify-center justify-items-center pt-10">
      <p class="text-white font-semibold text-4xl pt-5 pb-8">Your Bookings</p>
      <p v-if="isLoading" class="text-grey font-semibold text-2xl space-x-16 pt-20">Loading Upcoming Bookings...</p>
      <ul v-if="!isLoading && bookings && bookings.length > 0" class="list-none pl-4 text-stone-400 text-lg" style="max-width: 500px; margin-left: auto; margin-right: auto">
        <ManageableBookingChip v-for="booking in bookings" :tag="booking.id" :booking="booking"/>
      </ul>
      <p v-if="!isLoading && (!bookings || bookings.length === 0)" class="text-grey font-semibold text-2xl space-x-16 pt-20">No Upcoming Bookings</p>
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

.list-container {
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}
.centered-button {
  margin-left: 1rem;
  margin-right: 1rem;
}
@media(max-width: 768px) {
  .list-container {
    max-width: 90%;
    margin-left: auto;
    margin-right: auto;
  }
  .centered-button {
    margin-bottom: 1rem;
  }
}

</style>
