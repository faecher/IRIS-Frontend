import { createRouter, createWebHistory } from 'vue-router'
import MapView from "./views/MapView.vue";
import SettingsView from "./views/SettingsView.vue";

const routes = [
    { path: '/', component: MapView },
    { path: '/settings', component: SettingsView },
    { path: '/:pathMatch(.*)*', component: MapView }
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
})

export default router
