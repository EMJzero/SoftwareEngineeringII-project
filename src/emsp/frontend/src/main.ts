import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router/router";
import "./assets/style.css";
import Toast, { type PluginOptions, POSITION } from "vue-toastification";
import "vue-toastification/dist/index.css";
import piniaPersist from "pinia-plugin-persist";
import 'vuetify/styles'
import { createVuetify, type ThemeDefinition } from 'vuetify'
import '@mdi/font/css/materialdesignicons.css'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'

const darkTheme: ThemeDefinition = {
  dark: true,
}

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'darkTheme',
    themes: {
      darkTheme
    }
  }
})

const pinia = createPinia();
pinia.use(piniaPersist);

const app = createApp(App);
app.use(vuetify)
app.use(pinia);
app.use(router);
app.component('Datepicker', Datepicker);
app.config.unwrapInjectedRef = true
const options: PluginOptions = {
  // You can set your default options here
  position: POSITION.TOP_CENTER,
};

app.use(Toast, options);

app.mount("#app");
