<script setup lang="ts">
import {useConnectionStore} from "../store/connection.ts";
import { ref } from "vue";
import BatteryIndicator from "./BatteryIndicator.vue";
import LastUpdateIndicator from "./LastUpdateIndicator.vue";
import type {Tracker} from "../models/tracker.ts";

const connectionStore = useConnectionStore();

const showList = ref<Boolean>(true);

function toggleList() {
  showList.value = !showList.value
}

function flyToMarker(item: Tracker) {
  // Add the point to the list of points the map should fly to
  connectionStore.flyTo.push([item.long, item.lat])
}

</script>

<template>
  <div class="maplibregl-ctrl-top-left">
    <div class="maplibregl-ctrl rounded-sm shadow-lg bg-white min-w-72">
      <div class="flex pt-1 pb-1 pl-2 pr-2">
        <p class="font-semibold text-lg">Tracker</p>
        <div class="grow"></div>
        <button @click="toggleList">
          <img v-if="showList" src="/arrow_up.svg" alt="Arrow Up"/>
          <img v-else src="/arrow_down.svg" alt="Arrow Down" />
        </button>
      </div>
      <div v-if="showList" class="overflow-auto max-h-full">
        <div v-for="tracker in connectionStore.markers" class="w-full flex pt-1 pb-1 pl-2 pr-2 hover:bg-gray-100" @click="flyToMarker(tracker)">
          <div>
            <p v-if="tracker.resource === null" class="select-none">{{ tracker.name }}</p>
            <p v-else class="select-none">{{ tracker.resource?.name }}</p>
            <LastUpdateIndicator :timestamp="tracker.lastUpdated" />
          </div>
          <div class="grow"></div>
          <BatteryIndicator :value="tracker.battery"/>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>