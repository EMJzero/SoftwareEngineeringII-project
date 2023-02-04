
<template>
  <nav v-if="isAuth" class="flex flex-wrap justify-between pt-5 pl-6 ">
    <button class="h-24 text-left font-bold text-3xl" @click="router.push(RoutingPath.HOME)"> eMall 🚗 </button>
    <div class="nav-bar-items pr-10 text-center items-center">
      <button
        class="nav-bar-item rounded-lg py-2 px-8 font-semibold text-blue-500 ring-blue-500 ring-[3px] hover:text-blue-400 hover:ring-blue-400"
        @click="router.push(RoutingPath.BOOKINGLIST)">
        Bookings
      </button>
      <button class="nav-bar-item rounded-lg py-2 px-9 font-semibold text-blue-500 ring-blue-500 ring-[3px] hover:text-blue-400 hover:ring-blue-400"
        @click="router.push(RoutingPath.SEARCH)">
        Stations
      </button>

      <div class="menus">
        <div class="menu-right">
          <v-btn color="blue" dark rounded @click="router.push(RoutingPath.NOTIFICATIONS)">
            <v-icon dark>
              mdi-bell-ring-outline
            </v-icon>
          </v-btn>
        </div>

        <div class="menu-left">
          <v-menu min-width="200px" rounded>
            <template v-slot:activator="{ props }">
              <v-btn icon v-bind="props">
                <v-avatar color="#3562E2" size="large">
              <span class="text-h5 text-white">{{
                  user?.username.slice(0, 2).toUpperCase()
                }}</span>
                </v-avatar>
              </v-btn>
            </template>
            <v-card>
              <v-card-text>
                <div class="mx-auto text-center">
                  <v-avatar color="#3562E2">
                <span class="text-h6 text-white">{{
                    user?.username.slice(0, 2).toUpperCase()
                  }}</span>
                  </v-avatar>
                  <h3 class="mt-3">{{ auth_controller.getRef().value?.username }}</h3>
                  <p class="text-caption opacity-70">
                    {{ user?.email }}
                  </p>
                  <v-divider class="mt-3"></v-divider>
                  <v-btn class="mt-3" rounded variant="text" color="red" @click="auth_controller.logout()">
                    Logout
                  </v-btn>
                </div>
              </v-card-text>
            </v-card>
          </v-menu>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import RoutingPath from '@/router/routing_path';
import auth_controller from '@/controllers/authorization_controller';
import { onMounted, ref, watch } from 'vue';

const router = useRouter();
let user = auth_controller.getRef();
let isAuth = ref(false);

onMounted(() => {
  isAuth.value = auth_controller.isAuthenticated.value;
});

watch(user, (val) => {
  isAuth.value = auth_controller.isAuthenticated.value;
});


</script>

<style>

.nav-bar-items {
  display: flex;
  flex-wrap: nowrap !important;
}
.nav-bar-item {
  margin-left: 0.8rem !important;
  margin-right: 0.8rem !important;
}
.menus {
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 0.8rem;
}
.menu-left {
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 0.8rem;
}
.menu-right {
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 0.8rem;
}
@media(max-width: 768px) {
  .nav-bar-items {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap !important;
    margin-left: auto;
    margin-right: auto;
    padding-right: 1rem !important;
  }

  .nav-bar-item {
    margin-left: auto;
    margin-right: auto;
    margin-bottom: 0.8rem;
  }

  .menus {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .menu-left {
    margin-left: 10px;
  }
  .menu-right {
    margin-right: 10px;
  }
}

</style>