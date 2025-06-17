import { defineStore } from "pinia";
import { socket } from "../socket";
import type {Ref} from "vue";
import {ref} from "vue";
import type {Tracker} from "../models/tracker.ts";
export const useConnectionStore = defineStore("connection", () => {
    const isConnected: Ref<boolean> = ref(true);
    const markers: Ref<Tracker[]> = ref([]);

    function bindEvents() {
        socket.on("connect", () => {
            isConnected.value = true;
            socket.emit("requestTrackerData", "");
        });
        socket.on("disconnect", () => {
            isConnected.value = false;
        });

        socket.on("getTrackerData", (...args) => {
            console.log(args)
        })
    }

    function connect() {
        socket.connect();
    }

    return { isConnected, connect, bindEvents }
});