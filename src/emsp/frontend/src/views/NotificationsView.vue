<template>
  <div class="relative w-full items-center justify-center">
    <div class="list-container text-center justify-items-center pt-2">
      <p class="text-white font-semibold text-4xl pt-5 pb-8">Your Notifications</p>
      <div class="text-white font-semibold text-xl pt-10 pb-4 items-center">
        <button class="centered-button rounded-lg bg-blue-600 py-3 px-16 font-normal text-white hover:bg-blue-700" @click="notification_controller.refreshNotifications()">Refresh</button>
        <button class="centered-button rounded-lg bg-red-600 py-3 px-16 font-normal text-white hover:bg-red-700" @click="notification_controller.clearNotifications()">Clear</button>
      </div>
      <p v-if="isLoading" class="text-grey font-semibold text-2xl space-x-16 pt-20">Loading Notifications...</p>
      <ul v-if="!isLoading && notifications && notifications.length > 0" class="list-none pl-4 text-stone-400 text-lg" style="margin-left: auto; margin-right: auto">
        <NotificationCell v-for="notification in notifications" :tag="notification.notificationId" :notification="notification"/>
      </ul>
      <p v-if="!isLoading && (!notifications || notifications.length === 0)" class="text-grey font-semibold text-2xl space-x-16 pt-20">No Notifications!</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import NotificationCell from "@/components/NotificationCell.vue";
import PrimaryButton from "@/components/PrimaryButton.vue";
import notification_controller from "@/controllers/notification_controller";

const dialog = ref(false);
const isLoading = ref(true);

const route = useRoute();

let notifications = notification_controller.getRef();

async function onClose(){
  dialog.value = false
}

// On Mounted page, collect the bookings data to display
onMounted(async () => {
  isLoading.value = true;
  await notification_controller.getNotifications()
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
