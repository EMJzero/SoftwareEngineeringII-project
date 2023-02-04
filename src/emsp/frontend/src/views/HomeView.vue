<template>
  <div class="relative w-full items-center justify-center">
    <div class="text-center text-white pt-5">
      <p class="font-semibold text-4xl">
        Welcome to eMall, @{{ auth_controller.getRef().value?.username }} 👋
      </p>
      <p class="text-stone-400">Your One-Stop EV Recharge Reservation System</p>
    </div>

    <div class="text-center items-center justify-center justify-items-center pt-10 list-container">
      <p class="text-white text-3xl font-semibold pb-3">Upcoming Bookings</p>
      <p v-if="isLoading" class="text-grey font-semibold text-2xl space-x-16 pt-20">Loading Upcoming Bookings...</p>
      <ul v-if="!isLoading && bookings && bookings.length > 0" class="list-none pl-4 text-stone-400 text-lg" style="margin-left: auto; margin-right: auto">
        <BookingChip v-for="booking in bookings" :tag="booking.id" :booking="booking"/>
      </ul>
      <p v-if="!isLoading && (!bookings || bookings.length === 0)" class="text-grey font-semibold text-2xl space-x-16 pt-20">No Upcoming Bookings</p>
      <div class="text-white font-semibold text-xl space-x-16 pt-20">
        <PrimaryButton text="See All & Manage" :onClick="() => router.push(RoutingPath.BOOKINGLIST)" />
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
import recent_bookings_controller from '@/controllers/recent_bookings_controller';

const dialog = ref(false);
const isLoading = ref(true);

const route = useRoute();

let bookings = recent_bookings_controller.getRef();

async function onClose(){
  dialog.value = false
}

// On Mounted page, collect the bookings data to display
onMounted(async () => {
  isLoading.value = true;
  await recent_bookings_controller.getUpcomingBookings();
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
    max-width: 80%;
    margin-left: auto;
    margin-right: auto;
  }
  .centered-button {
    margin-bottom: 1rem;
  }
}

</style>
