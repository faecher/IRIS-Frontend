<script setup lang="ts">
import type { Run } from '../models/run.ts'
import type { Tracker } from '../models/tracker.ts'
import { computed, ref } from 'vue'
import { useConnectionStore } from '../store/connection.ts'
import { useSettingsStore } from '../store/settings.ts'
import BatteryIndicator from './BatteryIndicator.vue'
import LastUpdateIndicator from './LastUpdateIndicator.vue'

const connectionStore = useConnectionStore()
const settingsStore = useSettingsStore()

const showList = ref<boolean>(true)

function toggleList() {
  showList.value = !showList.value
}

function flyToMarker(item: Tracker) {
  // Add the point to the list of points the map should fly to
  connectionStore.flyTo.push([item.position.lon, item.position.lat])
}

function flytoRun(item: Run) {
  if (!item.unsetPosition) {
    connectionStore.flyTo.push([item.long, item.lat])
  }
}

const filteredTrackers = computed<Tracker[]>(() => {
  // Keep this code! The list of trackers must be sorted by name to be passed to the marker or rendering and UI glitches occur!
  // Sorting by id or other attributes does not help, as only attributes used for rendering the markers influence it.
  const trackers = [...connectionStore.trackers].sort((a, b) => {
    // If one item has no resource assigned
    if (!a.resource || !b.resource) {
      // Use device EUIs if the names are the same
      if (a.name === b.name) {
        return a.deviceEUI < b.deviceEUI ? -1 : a.deviceEUI > b.deviceEUI ? 1 : 0
      }
      else {
        return a.name < b.name ? -1 : a.name > b.name ? 1 : 0
      }
    }
    else {
      return (a.resource?.resource.name ?? '') < (b.resource?.resource.name ?? '') ? -1 : (a.resource?.resource.name ?? '') > (b.resource?.resource.name ?? '') ? 1 : 0
    }
  })

  if (settingsStore.showUnassignedTrackers) {
    if (settingsStore.showInactiveMarkers) {
      return trackers
    }
    return trackers.filter(marker => marker.resource?.status !== 6)
  }

  // Show only assigned trackers (where the resource is not null)
  return trackers.filter(marker => marker.resource !== null)
},
)

const sortedRuns = computed<Run[]>(() => {
  return [...connectionStore.runs].sort((a, b) => a.nr < b.nr ? -1 : a.nr > b.nr ? 1 : 0)
})
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
      <div v-if="showList" class="max-h-[90vh] scrollbar-auto overflow-y-auto">
        <div
          v-for="tracker in filteredTrackers"
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
        <div
          v-for="run in sortedRuns" :key="run.id"
          class="w-full flex pt-1 pb-1 pl-2 pr-2 hover:bg-gray-300 dark:hover:bg-gray-700"
          @click="flytoRun(run)"
        >
          <div>
            <p>Einsatz {{ run.nr }}</p>
            <p v-if="run.address" class="text-sm text-gray-500 select-none">
              {{ run.address }}
            </p>
            <p v-else-if="!run.unsetPosition" class="text-sm text-gray-500 select-none">
              Position manuell gesetzt
            </p>
            <p v-else class="text-sm text-gray-500 select-none">
              Adresse unbekannt
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
