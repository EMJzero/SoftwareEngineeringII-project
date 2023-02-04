<template>
  <form @submit="submitForm">
    <div class="flex form-container">
      <div class="form-section-25 mx-4 mb-2 px-4">
        <p class="text-grey-darken-1 font-semibold text-2xl">Socket Type</p>
        <div v-for="connector in getUniqueConnectors()" class="bordered rounded-lg py-4 my-4 px-6" :class="{'border-blue-600': connector === selectedConnector, 'border-gray-400': connector !== selectedConnector}">
          <input ref="inputButton" type="radio" :id="connector" :name="connectorID" :checked="connector === selectedConnector" @click="changeSelectedConnector(connector)">
          <label :for="connector" class="text-white font-semibold text-lg px-4"> {{connector}} </label>
        </div>
      </div>
      <div class="form-section-25 mx-4 mb-2 px-4">
        <p class="text-grey-darken-1 font-semibold text-2xl">Charge Speed</p>
        <div v-for="chargeSpeed in getUniqueChargeSpeeds()" class="bordered rounded-lg py-4 my-4 px-6" :class="{'border-blue-600': chargeSpeed === selectedChargeSpeed, 'border-gray-400': chargeSpeed !== selectedChargeSpeed}">
          <input ref="inputButton" type="radio" :id="chargeSpeed" :name="chargeSpeedID" :checked="chargeSpeed === selectedChargeSpeed" @click="changeSelectedChargeSpeed(chargeSpeed)">
          <label :for="chargeSpeed" class="text-white font-semibold text-lg px-4"> {{chargeSpeed}} </label>
        </div>
      </div>
      <div class="form-section-50 mx-4 mb-2 px-4">
        <p class="text-grey-darken-1 font-semibold text-2xl">Time Slot</p>
        <!--<vue-tailwind-datepicker as-single :formatter="formatter" v-model="dateValue" style="max-width: 50%; margin-left: auto; margin-right: auto"/>-->
        <Datepicker :dark="true" :format="format" :min-date="new Date()" :prevent-min-max-navigation="true" v-model="dateValue" class="py-4" style="max-width: 50%; margin-left: auto; margin-right: auto" @update:model-value="modelChanged"></Datepicker>
        <div class="grid grid-resp mt-4 mx-3">
          <div v-for="availableSlot in stationAvailability" class="slot-btn bordered rounded-lg py-4 px-6" style="min-width: 165px" :class="{'border-blue-600': availableSlot === selectedSlot, 'border-gray-400': (availableSlot !== selectedSlot && (!AvailableIntervalsModel.isOnOffer(availableSlot, stationDetails?.stationData.offerExpirationDate) || getDiscountPerc() <= 0)), 'border-green-400': (availableSlot !== selectedSlot && AvailableIntervalsModel.isOnOffer(availableSlot, stationDetails?.stationData.offerExpirationDate) && getDiscountPerc() > 0)}">
            <input ref="inputButton" type="radio" :id="availableSlot" :name="timeSlotID" :checked="availableSlot === selectedSlot" @click="changeSelectedTimeSlot(availableSlot)">
            <label :for="availableSlot" class="text-white font-semibold text-lg px-4"> {{availableSlot.startHour.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false })}} - {{availableSlot.endHour.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false })}}{{(AvailableIntervalsModel.isOnOffer(availableSlot, stationDetails?.stationData.offerExpirationDate) && getDiscountPerc() > 0) ? '  🏷️️' : ''}} </label>
          </div>
        </div>
        <p v-if="isLoadingDates" class="text-center text-gray-500 font-semibold text-2xl my-8">Loading Available Slots...</p>
        <p v-if="stationAvailability != null && stationAvailability.length === 0 && !isLoadingDates" class="text-center text-gray-500 font-semibold text-2xl my-8">No Slots Available!</p>
        <p v-if="stationDetails?.stationData.offerExpirationDate && dateValue.valueOf() < stationDetails.stationData.offerExpirationDate && getDiscountPerc() > 0" class="text-center text-gray-500 font-semibold text-2xl my-8">🏷️ Offer: -{{getDiscountPerc()}}% Off on Charge Price</p>
      </div>
    </div>
    <div class="text-center mt-10">
      <p class="text-center text-white font-semibold text-2xl my-8">Recharge Price: {{stationDetails?.stationData.userPrice ?? 0}} $/kWh</p>
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
let selectedSlot = ref((stationAvailability.value ?? [])[0]);
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
  if (stationDetails.value?.stationData) {
    return Array.from(new Set(stationDetails.value?.stationData.sockets?.map((socket) => socket.type.connector)));
  }
  return []
}

function getUniqueChargeSpeeds(): string[] {
  if (stationDetails.value?.stationData) {
    return Array.from(new Set(stationDetails.value?.stationData.sockets?.map((socket) => SocketType.getChargeSpeed(socket.type))));
  }
  return []
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

function getDiscountPerc(): number {
  const stationData = stationDetails.value?.stationData
  if (stationData) {
    const offerPrice = stationData.userPrice;
    const nominalPrice = stationData.nominalPrice;
    const reduction = nominalPrice - offerPrice;
    return Math.floor((reduction / nominalPrice) * 100);
  }
  return 0;
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
  } else {
    //Reload
    isLoadingDates.value = true;
    await booking_create_controller.getStationAvailability(selectedConnector.value, selectedChargeSpeed.value, dateValue.value);
    changeSelectedTimeSlot((stationAvailability.value ?? [])[0])
    isLoadingDates.value = false;
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

.slot-btn {
  padding: 1rem 1rem;
}
.grid-resp {
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1.5rem;
}
.form-container {
  flex-direction: row;
}
.form-section-25 {
  flex-basis: 25%;
}
.form-section-50 {
  flex-basis: 50%;
}
@media(max-width: 2000px) {
  .grid-resp {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.5rem;
  }
}
@media(max-width: 1500px) {
  .grid-resp {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.5rem;
  }
  .slot-btn {
    padding: 0.2rem 0.5rem;
  }
}
@media(max-width: 1100px) {
  .grid-resp {
    grid-template-columns: auto;
    gap: 0.5rem;
  }
}
@media(max-width: 900px) {
  .form-container {
    flex-direction: column;
  }
  .form-section-25 {
    flex-basis: auto;
  }
  .form-section-50 {
    flex-basis: auto;
  }
  .grid-resp {
    grid-template-columns: auto;
    gap: 0.5rem;
  }
  .slot-btn {
    padding: 0.2rem 0.5rem;
  }
}

</style>