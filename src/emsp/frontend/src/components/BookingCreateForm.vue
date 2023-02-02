<template>
  <form @submit="submitForm">
    <div class="flex flex-row">
      <div class="basis-1/4 mx-4 px-4">
        <p class="text-grey-darken-1 font-semibold text-2xl">Socket Type</p>
        <div v-for="connector in getUniqueConnectors()" class="bordered rounded-lg py-4 my-4 px-6" :class="{'border-blue-600': connector === selectedConnector, 'border-gray-400': connector !== selectedConnector}">
          <input ref="inputButton" type="radio" :id="connector" :name="connectorID" :checked="connector === selectedConnector" @click="changeSelectedConnector(connector)">
          <label :for="connector" class="text-white font-semibold text-lg px-4"> {{connector}} </label>
        </div>
      </div>
      <div class="basis-1/4 mx-4 px-4">
        <p class="text-grey-darken-1 font-semibold text-2xl">Charge Speed</p>
        <div v-for="chargeSpeed in getUniqueChargeSpeeds()" class="bordered rounded-lg py-4 my-4 px-6" :class="{'border-blue-600': chargeSpeed === selectedChargeSpeed, 'border-gray-400': chargeSpeed !== selectedChargeSpeed}">
          <input ref="inputButton" type="radio" :id="chargeSpeed" :name="chargeSpeedID" :checked="chargeSpeed === selectedChargeSpeed" @click="changeSelectedChargeSpeed(chargeSpeed)">
          <label :for="chargeSpeed" class="text-white font-semibold text-lg px-4"> {{chargeSpeed}} </label>
        </div>
      </div>
      <div class="basis-1/2 mx-4 px-4">
        <p class="text-grey-darken-1 font-semibold text-2xl">Time Slot</p>
        <!--<vue-tailwind-datepicker as-single :formatter="formatter" v-model="dateValue" style="max-width: 50%; margin-left: auto; margin-right: auto"/>-->
        <Datepicker :dark="true" :format="format" :min-date="new Date()" :prevent-min-max-navigation="true" v-model="dateValue" class="py-4" style="max-width: 50%; margin-left: auto; margin-right: auto" @update:model-value="modelChanged"></Datepicker>
        <div class="grid grid-cols-4 gap-6 mt-4 mx-3">
          <div v-for="availableSlot in stationAvailability" class="bordered rounded-lg py-4 px-6" :class="{'border-blue-600': availableSlot === selectedSlot, 'border-gray-400': availableSlot !== selectedSlot}">
            <input ref="inputButton" type="radio" :id="availableSlot" :name="timeSlotID" :checked="availableSlot === selectedSlot" @click="changeSelectedTimeSlot(availableSlot)">
            <label :for="availableSlot" class="text-white font-semibold text-lg px-4"> {{availableSlot.startHour.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false })}} - {{availableSlot.endHour.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false })}} </label>
          </div>
        </div>
        <p v-if="isLoadingDates" class="text-center text-gray-500 font-semibold text-2xl my-8">Loading Available Slots...</p>
        <p v-if="stationAvailability != null && stationAvailability.length === 0 && !isLoadingDates" class="text-center text-gray-500 font-semibold text-2xl my-8">No Slots Available!</p>
      </div>
    </div>
    <div class="text-center mt-10">
      <input class="rounded-lg bg-blue-600 py-3 px-16 font-medium text-white hover:bg-blue-700" style="margin-right: auto; margin-left: auto" type="submit" value="Create Booking">
    </div>
  </form>
</template>

<script setup lang="ts">
import booking_create_controller from "@/controllers/booking_create_controller";
import {onMounted, ref} from "vue";
import {SocketType} from "@/model/socket_model";
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'
import station_availability_controller from "@/controllers/station_availability_controller";
import AvailableIntervalsModel from "@/model/available_intervals_model";
import {useRouter} from "vue-router";
import RoutingPath from "@/router/routing_path";

const date = ref();

const dateValue = ref(new Date())
let stationDetails = booking_create_controller.getRef();
let selectedConnector = ref(getUniqueConnectors()[0]);
let selectedChargeSpeed = ref(getUniqueChargeSpeeds()[0]);
let stationAvailability = station_availability_controller.getRef();
let selectedSlot = ref((stationAvailability.value ?? [""])[0]);
const connectorID = "bookedConnector";
const chargeSpeedID = "bookedChargeSpeed";
const timeSlotID = "timeSlot";
const format = (date: Date) => {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}
const isLoadingDates = ref(false);

function getUniqueConnectors(): string[] {
  return Array.from(new Set(stationDetails.value?.stationData.sockets?.map((socket) => socket.type.connector)));
}

function getUniqueChargeSpeeds(): string[] {
  return Array.from(new Set(stationDetails.value?.stationData.sockets?.map((socket) => SocketType.getChargeSpeed(socket.type))));
}

async function changeSelectedConnector(connectorNew: string) {
  selectedConnector.value = connectorNew;
  await reloadDates();
}

async function changeSelectedChargeSpeed(chargeSpeedNew: string) {
  selectedChargeSpeed.value = chargeSpeedNew;
  await reloadDates();
}

function changeSelectedTimeSlot(timeSlotNew: AvailableIntervalsModel) {
  selectedSlot.value = timeSlotNew;
}

function modelChanged() {
  reloadDates();
}

async function submitForm(event: Event) {
  event.preventDefault();
  event.stopPropagation();
  const created = await booking_create_controller.createBooking(selectedConnector.value, selectedChargeSpeed.value, dateValue.value, selectedSlot.value);
  if (created) {
    await router.push(RoutingPath.BOOKINGLIST);
  }
}

onMounted(async () => {
  isLoadingDates.value = true;
  await booking_create_controller.getStationAvailability(selectedConnector.value, selectedChargeSpeed.value, dateValue.value);
  changeSelectedTimeSlot((stationAvailability.value ?? [])[0])
  isLoadingDates.value = false;
})

async function reloadDates() {
  isLoadingDates.value = true;
  await booking_create_controller.getStationAvailability(selectedConnector.value, selectedChargeSpeed.value, dateValue.value);
  changeSelectedTimeSlot((stationAvailability.value ?? [])[0])
  isLoadingDates.value = false;
}

const router = useRouter();
</script>

<style scoped>

.bordered {
  border-width: 6px !important;
  border-style: solid !important;
}

</style>