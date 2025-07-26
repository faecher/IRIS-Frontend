import { defineStore } from "pinia";
import { ref, type Ref } from "vue";
import type { Tracker } from "../models/tracker.ts";
import type {LngLatLike} from "maplibre-gl";
import axios from "axios";
import base from "../api/base.ts";

export const useConnectionStore = defineStore("connection", () => {
    const isConnected: Ref<boolean> = ref(true);
    const markers: Ref<Tracker[]> = ref([]);

    const flyTo: Ref<LngLatLike[]> = ref([]);

    let interval: any;

    function updateData() {
        axios.get(base.root_url + '/api/tracker/',{
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 500
        }).then(function (response) {
            // Reload the data
            markers.value = response.data;

            // Sort trackers according to their name
            markers.value.sort((a, b) => {
                let item_a = a.resource == null ? a.name : a.resource.name;
                let item_b = b.resource == null ? b.name : b.resource.name;
                if (item_a  < item_b) {
                    return -1;
                } else if (item_a > item_b) {
                    return 1;
                } else {
                    return 0;
                }
            })

        }).catch(function (e) {
            console.log(e);
        })
    }

    function bindEvents() {
        interval = setInterval(updateData, 2500)
    }

    function clearEvents() {
        clearInterval(interval)
    }

    return { isConnected, bindEvents, clearEvents, markers, flyTo }
});