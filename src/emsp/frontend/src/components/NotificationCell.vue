<template>
  <li class="bg-grey-darken-2 rounded-lg py-4 px-8 shadow-lg my-4">
    <p class="text-left text-sm font-weight-regular text-white"> {{ getDate() }} </p>
    <p class="text-left text-xl font-bold text-white"> {{ notification.content }} </p>
  </li>
</template>

<script setup lang="ts">
import { defineProps, ref } from 'vue';
import ModalComponent from '@/components/ModalComponent.vue';
import type BookingModel from '@/model/booking_model';
import {reduceFullDateString} from "@/helpers/converters";
import NotificationModel from "@/model/notification_model";

const props = defineProps<{
  notification: NotificationModel;
}>();

function getDate(): string {
  return reduceFullDateString(new Date(props.notification.generationDate).toString());
}

</script>

<style scoped>

</style>