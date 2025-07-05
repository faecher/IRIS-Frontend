import { defineStore } from "pinia";
import { socket } from "../socket";
import { ref, type Ref } from "vue";
import type { Tracker } from "../models/tracker.ts";
import type {LngLatLike} from "maplibre-gl";

export const useConnectionStore = defineStore("connection", () => {
    const isConnected: Ref<boolean> = ref(true);
    const markers: Ref<Tracker[]> = ref([]);

    const flyTo: Ref<LngLatLike[]> = ref([]);

    function bindEvents() {
        socket.on("connect", () => {
            isConnected.value = true;
            socket.emit("requestTrackerData", "");
        });
        socket.on("disconnect", () => {
            isConnected.value = false;
        });

        socket.on("getTrackerData", (...args) => {
            markers.value = args[0].devices;
        })
    }

    function connect() {
        socket.connect();
    }

    return { isConnected, connect, bindEvents, markers, flyTo }
});