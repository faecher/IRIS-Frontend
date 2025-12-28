import { createApp } from 'vue'
import VueMaplibreGl from '@indoorequal/vue-maplibre-gl'
import './style.css'
import App from './App.vue'
import {createPinia} from "pinia";
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import router from './router'

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate)

const app = createApp(App);
app.use(router);
app.use(pinia);
app.use(VueMaplibreGl)
app.mount('#app')
