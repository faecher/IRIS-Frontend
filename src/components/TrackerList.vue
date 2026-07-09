<script setup lang="ts">
import type { Tracker } from '../models/tracker.ts'
import { ref } from 'vue'
import { useConnectionStore } from '../store/connection.ts'
import BatteryIndicator from './BatteryIndicator.vue'
import LastUpdateIndicator from './LastUpdateIndicator.vue'

const connectionStore = useConnectionStore()

const showList = ref<boolean>(true)

function toggleList() {
  showList.value = !showList.value
}

function flyToMarker(item: Tracker) {
  // Add the point to the list of points the map should fly to
  connectionStore.flyTo.push([item.position.lon, item.position.lat])
}
</script>

<template>
  <div class="maplibregl-ctrl-top-left">
    <div class="maplibregl-ctrl rounded-sm shadow-lg bg-white dark:bg-gray-900 min-w-72">
      <div class="flex pt-1 pb-1 pl-2 pr-2">
        <p class="font-semibold text-lg">
          Tracker
        </p>
        <div class="grow" />
        <button @click="toggleList">
          <!-- Material Icons (Keyboard Arrow Up/Down). Apache License, Version 2.0 -->
          <svg v-if="showList" class="dark:fill-white" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f">
            <path d="M480-528 296-344l-56-56 240-240 240 240-56 56-184-184Z" />
          </svg>
          <svg v-else class="dark:fill-white" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f">
            <path d="M480-344 240-584l56-56 184 184 184-184 56 56-240 240Z" />
          </svg>
        </button>
      </div>
      <div v-if="showList" class="max-h-[93vh] overflow-y-scroll">
        <div
          v-for="tracker in connectionStore.trackers.sort((a, b) => a.name.localeCompare(b.name))"
          :key="tracker.id"
          class="w-full flex pt-1 pb-1 pl-2 pr-2 hover:bg-gray-300 dark:hover:bg-gray-700"
          @click="flyToMarker(tracker)"
        >
          <div>
            <p v-if="tracker.resource === null" class="select-none">
              {{ tracker.name }}
            </p>
            <p v-else class="select-none">
              {{ tracker.resource?.resource.name }}
            </p>
            <LastUpdateIndicator :timestamp="tracker.lastUpdate" />
          </div>
          <div class="grow" />
          <BatteryIndicator :value="tracker.battery" />
        </div>
      </div>
    </div>
  </div>
</template>
