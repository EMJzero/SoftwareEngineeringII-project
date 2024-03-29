<template>
  <div class="flex items-center justify-center p-5 h-screen">
    <div class="max-w-xl space-y-8">
      <div class="rounded-3xl shadow-2xl p-10 bg-blue-600 shadow-blue-500">
        <div>
          <p class="mt-6 text-center tracking-tight text-white text-4xl font-semibold">
            {{ showLogin ? "Login to Your Account": "Create a New Account" }}
          </p>
        </div>

        <form @submit.prevent="onSubmitted" class="mt-8 space-y-6">
          <div class="-space-y-px rounded-md shadow-sm relative">
            <div class="placeholder-gray-500">
              <label for="username-id" class="sr-only">Username</label>
              <input id="username-id" name="username" required="true" v-model="username"
                class="relative w-full appearance-none rounded-none rounded-t-md bg-white border border-gray-300 px-3 py-2 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-base"
                placeholder="Username" />
            </div>
            <div v-if="!showLogin" class="relative animate-slide-in placeholder-gray-500">
              <label for="email-address" class="sr-only">Email address</label>
              <input id="email-address" name="email" type="email" autocomplete="email" required="true" v-bind:class="{
                'rounded-t-md': showLogin,
              }" v-model="email" placeholder="Email address"
                class="relative w-full appearance-none rounded-none border bg-white border-gray-300 px-3 py-2 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-base" />
            </div>

            <div>
              <label for="password" class="sr-only">Password</label>
              <div
                class="flex relative justify-between items-center bg-white rounded-none rounded-b-md border border-gray-300 px-3 py-2 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-base">
                <input @focus="() => (showHintPassword = true)" id="password" name="password"
                  :type="showPass ? 'text' : 'password'" autocomplete="current-password" required="true"
                  v-model="password" class="relative appearance-none outline-none h-full w-full"
                  placeholder="Password" />

                <button @click.prevent="showPass = !showPass" class="absolute right-7 top-2">
                  <EyeSlashIcon :class="showPass ? 'opacity-0' : 'opacity-100'"
                    class="w-5 absolute duration-1000 fill-blue-500"></EyeSlashIcon>
                  <EyeIcon :class="!showPass ? 'opacity-0' : 'opacity-100'"
                    class="w-5 absolute duration-1000 fill-blue-500"></EyeIcon>
                </button>
              </div>
            </div>

            <!-- CREDIT CARD DATA -->
            <div v-if="!showLogin" class="relative animate-slide-in placeholder-gray-500 mt-5">
              <label for="creditCardBillingName" class="sr-only">Credit Card Billing Name</label>
              <input id="creditCardBillingName" name="creditCardBillingName" required="true" v-bind:class="{
                'rounded-t-md': showLogin,
              }" v-model="creditCardBillingName" placeholder="Credit Card Billing Name"
                     class="relative w-full appearance-none rounded-none rounded-t-md border bg-white border-gray-300 px-3 py-2 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-base" />
            </div>
            <div v-if="!showLogin" class="relative animate-slide-in placeholder-gray-500">
              <label for="creditCardNumber" class="sr-only">Credit Card Number</label>
              <input id="creditCardNumber" name="creditCardNumber" required="true" v-bind:class="{
                'rounded-t-md': showLogin,
              }" v-model="creditCardNumber" placeholder="Credit Card Number"
                     class="relative w-full appearance-none rounded-none rounded-b-md border bg-white border-gray-300 px-3 py-2 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-base" />
            </div>
            <div v-if="!showLogin" class="relative animate-slide-in placeholder-gray-500 mt-1">
              <label for="creditCardExpiration" class="sr-only">Card Expiration</label>
              <input id="creditCardExpiration" name="creditCardExpiration" required="true" v-bind:class="{
                'rounded-t-md': showLogin,
              }" v-model="creditCardExpiration" placeholder="Card Expiration"
                     class="relative w-50 appearance-none rounded border bg-white border-gray-300 px-3 py-2 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-base" style="max-width: 45%; margin-right: 5%" />

              <label for="creditCardCVV" class="sr-only">CVV</label>
              <input id="creditCardCVV" name="creditCardCVV" v-bind:class="{
                'rounded-t-md': showLogin,
              }" v-model="creditCardCVV" placeholder="CVV"
                     class="relative appearance-none rounded border bg-white border-gray-300 px-3 py-2 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-base" style="max-width: 45%; margin-left: 5%" />
            </div>
          </div>

          <div class="flex justify-start">
            <ul>
              <li v-show="showHintPassword" class="flex items-center animate-fade-in">
                <div :class="{
                  'bg-green-200 text-green-700': isValidPassword,
                  'bg-red-200 text-red-700': !isValidPassword,
                }" class="rounded-full p-1 fill-current">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path v-show="isValidPassword" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M5 13l4 4L19 7" />
                    <path v-show="!isValidPassword" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <span :class="{
                  'text-green-400': isValidPassword,
                  'text-red-200': !isValidPassword,
                }" class="font-medium text-sm ml-3" v-text="
  isValidPassword
    ? 'The minimum length is reached'
    : 'At least 9 characters required'
"></span>
              </li>
            </ul>
          </div>

          <!-- <div v-if="showLogin" class="flex items-center justify-between animate-fade-in">
            <div class="flex items-center">
              <input id="remember-me" v-model="remindMeChecked" type="checkbox"
                class="h-4 w-4 rounded border-gray-300 focus:ring-blue-500" />
              <label for="remember-me" class="ml-2 block text-base text-slate-200">Remember me</label>
            </div>

            <div class="text-base">
              <a href="#" class="font-medium text-slate-200 hover:text-white">Forgot your password?</a>
            </div>
          </div> -->

          <div>
            <button :class="isButtonEnable ? 'hover:bg-blue-900' : 'bg-blue-300'" :disabled="!isButtonEnable"
              class="w-full rounded-md bg-blue-800 py-2 px-4 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-900 focus:ring-offset-2">
              {{ showLogin? "Login": "Sign Up" }}
            </button>
          </div>
        </form>

        <div class="flex text-sm text-center justify-center gap-1 pt-4">
          <p class="text-slate-300">
            {{
              showLogin
              ? "Don't have an account?"
                : "Do you already have an account?"
            }}
          </p>
          <button class="font-medium text-slate-200 hover:text-white" @click="changeView">
            {{ showLogin ? "Sign Up": "Login" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { EyeSlashIcon, EyeIcon } from "@heroicons/vue/24/solid";
import auth_controller from "@/controllers/authorization_controller";
import router from "@/router/router";
import RoutingPath from "@/router/routing_path";

const showPass = ref(false);
const remindMeChecked = ref<boolean>();
const showLogin = ref<boolean>(true);
const username = ref<string>("");
const email = ref<string>("");
const password = ref<string>("");
const creditCardBillingName = ref<string>("");
const creditCardNumber = ref<string>("");
const creditCardCVV = ref<string>("");
const creditCardExpiration = ref<string>("");
const isLoading = ref<boolean>(false);
const showHintPassword = ref<boolean>(false);

const isValidEmail = computed(() => {
  if (email.value.length) return true;
  return false;
});

const isValidPassword = computed(() => {
  if (password.value.length < 9) {
    return false;
  } else {
    return true;
  }
});

const isButtonEnable = computed(() => {
  if (isLoading.value) return false;
  if (showLogin.value) {
    return username.value.length > 0 && isValidPassword.value;
  }
  return (
    isValidEmail.value && isValidPassword.value && username.value.length > 0
  );
});

function changeView() {
  showLogin.value = !showLogin.value;
}

async function onSubmitted() {
  isLoading.value = true;
  if (showLogin.value) {
    const res = await auth_controller.login(username.value, password.value);
    if (res) router.replace(RoutingPath.HOME);
  } else {
    await _signUp();
  }
  isLoading.value = false;
}

async function _signUp() {
  await auth_controller
    .register(username.value, email.value, password.value, creditCardBillingName.value, creditCardNumber.value, creditCardCVV.value, creditCardExpiration.value)
    .then((res) => {
      if (res) {
        changeView();
      }
    });
}
</script>

<style scoped>

</style>
