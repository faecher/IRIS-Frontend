<script setup lang="ts">
import type { AxiosError } from 'axios'
import type { Map as MaplibreMap, MapMouseEvent, StyleSpecification } from 'maplibre-gl'
import type { Run } from '../models/run.ts'
import type { Tracker } from '../models/tracker.ts'
import { MglMap, MglNavigationControl } from '@indoorequal/vue-maplibre-gl'
import { colorful } from '@versatiles/style'
import { useMagicKeys } from '@vueuse/core'
import { setWorkerUrl } from 'maplibre-gl'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import { computed, onMounted, ref, watch } from 'vue'
import { useConnectionStore } from '../store/connection.ts'
import { useSettingsStore } from '../store/settings.ts'
import EntityDetailsPanel from './EntityDetailsPanel.vue'
import Marker from './Marker.vue'
import RunPlacementWarning from './RunPlacementWarning.vue'
import 'maplibre-gl/dist/maplibre-gl.css'

setWorkerUrl(workerUrl)

const settingsStore = useSettingsStore()
const connectionStore = useConnectionStore()

const { escape } = useMagicKeys()

const versatilesServerURL: string = `http://${window.location.host}`

const vectorTilesStyle = colorful({
  baseUrl: versatilesServerURL,
  language: 'de',
})

const osmStyle: StyleSpecification = {
  version: 8,
  name: 'Raster tiles',
  center: [0, 0],
  zoom: 0,
  sources: {
    'raster-tiles': {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      minzoom: 0,
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: {
        'background-color': '#e0dfdf',
      },
    },
    {
      id: 'simple-tiles',
      type: 'raster',
      source: 'raster-tiles',
    },
  ],
}

const map = ref<{ map?: MaplibreMap } | null>(null)
const center = ref<[number, number]>([8.4, 49])
const zoom = ref<number>(11)
const mouseCoordinates = ref<[number, number]>([8.4, 49])
const placementTarget = ref<{ runId: string } | null>(null)
const placementTracker = ref<{ trackerId: string, resourceId: string } | null>(null)
const selectedEntity = ref<{ id: string, kind: 'tracker' | 'run' } | null>(null)

function isKnownRun(run: Run) {
  return !run.unsetPosition
}

const mapStyle = computed(() => {
  if (settingsStore.useVectorTiles) {
    return vectorTilesStyle
  }
  return osmStyle
})

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

const visibleRuns = computed<Run[]>(() => [...connectionStore.runs].sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
const unknownRuns = computed(() => connectionStore.runs.filter(run => !isKnownRun(run)))

const selectedTracker = computed(() => {
  const selected = selectedEntity.value
  if (!selected || selected.kind !== 'tracker') {
    return null
  }

  return [...connectionStore.trackers].find(tracker => tracker.id === selected.id) ?? null
})

const selectedRun = computed(() => {
  const selected = selectedEntity.value
  if (!selected || selected.kind !== 'run') {
    return null
  }

  return connectionStore.runs.find(run => run.id === selected.id) ?? null
})

const placementRun = computed(() => placementTarget.value
  ? connectionStore.runs.find(run => run.id === placementTarget.value?.runId) ?? null
  : null,
)
const placingTracker = computed(() => placementTracker.value
  ? connectionStore.trackers.find(item => item.id === placementTracker.value?.trackerId) ?? null
  : null,
)
const isPlacingRun = computed(() => placementRun.value !== null)
const isPlacingTracker = computed(() => placingTracker.value !== null)

watch(escape, (v) => {
  if (v) {
    selectedEntity.value = null
    placementTarget.value = null
    placementTracker.value = null
  }
})

onMounted(() => {
  // Use MapLibre API directly for click handler (more reliable than vue event binding)
  const mapInstance = map.value?.map
  if (mapInstance) {
    mapInstance.on('click', (event) => {
      // console.log('MapLibre click event fired at:', event.lngLat.lng, event.lngLat.lat)
      if (!placementRun.value && !placingTracker.value) {
        // console.log('No placement run set')
        return
      }
      const { lng, lat } = event.lngLat
      if (placementRun.value != null) {
        // console.log('Updating run position for', placementRun.value.id, 'to', lat, lng)
        connectionStore.updateRunPosition(placementRun.value.id, lat, lng)
          .then(() => {
            // console.log('Position updated successfully')
            connectionStore.updateRuns()
            placementTarget.value = null
          })
          .catch((error) => {
            console.error('Failed to update run position:', error)
          })
      }
      else if (placementTracker.value != null) {
        connectionStore.updateResourcePosition(placementTracker.value.resourceId, lat, lng)
          .then(() => {
            // console.log('Position updated successfully')
            connectionStore.updateTrackers()
            placementTracker.value = null
          })
          .catch((error: AxiosError) => {
            console.error('Failed to update run position:', error)
          })
      }
    })
  }

  watch(() => connectionStore.flyTo, () => {
    if (connectionStore.flyTo.length > 0) {
      map.value?.map?.flyTo({
        center: connectionStore.flyTo[0],
      })
      connectionStore.flyTo.shift()
    }
  }, { deep: true })
})

function toggleMapStyle() {
  settingsStore.useVectorTiles = !settingsStore.useVectorTiles
}

function flyToTracker(item: Tracker): void {
  map.value?.map?.flyTo({
    center: [item.position.lon, item.position.lat],
  })
}

function flyToRun(run: Run): void {
  if (!isKnownRun(run)) {
    return
  }

  map.value?.map?.flyTo({
    center: [run.long, run.lat],
  })
}

function handleTrackerClick(item: Tracker) {
  if (selectedEntity.value !== null) {
    if (selectedEntity.value.id !== item.id) {
      selectedEntity.value = null
    }
  }
  if (item.resource !== null) {
    selectedEntity.value = { id: item.id, kind: 'tracker' }
  }
  flyToTracker(item)
}

function handleRunClick(item: Run) {
  selectedEntity.value = { id: item.id, kind: 'run' }
  flyToRun(item)
}

function startRunPlacement(run: Run) {
  // console.log('Starting run placement for:', run.id)
  placementTarget.value = { runId: run.id }
  if (!mouseCoordinates.value) {
    mouseCoordinates.value = [center.value[0], center.value[1]]
  }
}

function startTrackerPlacement(tracker: Tracker) {
  placementTracker.value = { trackerId: tracker.id, resourceId: tracker.resource?.id ?? '' }
  // console.log(tracker.resource?.id)
  if (!mouseCoordinates.value) {
    mouseCoordinates.value = [center.value[0], center.value[1]]
  }
}

function resetTrackerPositionOverride(tracker: Tracker) {
  connectionStore.resetResourcePosition(tracker.resource?.id ?? '').then(() => {
    selectedEntity.value = null
  })
}

function closeDetails() {
  selectedEntity.value = null
}

function repositionSelected() {
  if (selectedRun.value) {
    startRunPlacement(selectedRun.value)
  }
  else if (selectedTracker.value) {
    startTrackerPlacement(selectedTracker.value)
  }
}

function handleMapMouseMove(event: { event: MapMouseEvent }) {
  const { lng, lat } = event.event?.lngLat
  mouseCoordinates.value = [lng, lat]
}
</script>

<template>
  <MglMap
    ref="map"
    :map-style="mapStyle"
    :zoom="zoom"
    :center="center"
    height="100vh"
    @map:mousemove="handleMapMouseMove"
  >
    <MglNavigationControl position="top-right" />
    <mgl-custom-control position="bottom-right">
      <button class="maplibregl-ctrl-icon">
        <router-link to="settings" class="maplibregl-ctrl-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg" class="m-1.25"
            viewBox="0 0 512 512"
          >
            <path d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z" />
          </svg>
        </router-link>
      </button>
    </mgl-custom-control>

    <mgl-custom-control position="bottom-right">
      <button class="maplibregl-ctrl-icon" @click="toggleMapStyle">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" class="m-0.5">
          <path d="m24 41.5-18-14 2.5-1.85L24 37.7l15.5-12.05L42 27.5Zm0-7.6-18-14 18-14 18 14Zm0-15.05Zm0 11.25 13.1-10.2L24 9.7 10.9 19.9Z" />
        </svg>
      </button>
    </mgl-custom-control>

    <mgl-scale-control />

    <mgl-custom-control position="bottom-right" class="bg-important-transparent p-2">
      <div class="pointer-events-none flex max-w-[calc(100vw-1rem)] flex-col gap-2 bg-transparent">
        <RunPlacementWarning
          v-for="run in unknownRuns"
          :key="run.id"
          :run="run"
          :active="placementTarget?.runId === run.id"
          @place="startRunPlacement(run)"
        />

        <EntityDetailsPanel
          v-if="selectedTracker"
          :entity="selectedTracker"
          @close="closeDetails"
          @reposition="repositionSelected"
          @reset="resetTrackerPositionOverride(selectedTracker)"
        />
        <EntityDetailsPanel
          v-else-if="selectedRun"
          :entity="selectedRun"
          @close="closeDetails"
          @reposition="repositionSelected"
        />
      </div>
    </mgl-custom-control>

    <Marker
      v-if="isPlacingRun"
      :coordinates="[mouseCoordinates[0], mouseCoordinates[1]]"
      kind="run"
      name="Neue Position"
      status="PIN"
      :selected="true"
    />
    <Marker
      v-else-if="isPlacingTracker"
      :coordinates="[mouseCoordinates[0], mouseCoordinates[1]]"
      kind="tracker"
      name="Neue Position"
      status="PIN"
      :selected="true"
    />
    <Marker
      v-for="item in filteredTrackers"
      :key="item.id"
      kind="tracker"
      :name="item.resource?.resource.name ?? item.name"
      :status="item.resource?.status ?? '?'"
      :coordinates=" (item.resource?.unsetPosition ?? true) ? [item.position.lon, item.position.lat] : [item.resource?.lon ?? 0, item.resource?.lat ?? 0]"
      :selected="selectedEntity?.kind === 'tracker' && selectedEntity.id === item.id"
      @click="handleTrackerClick(item)"
    />
    <Marker
      v-for="item in visibleRuns"
      :key="item.id"
      kind="run"
      name="Einsatz"
      :status="item.nr.toString()"
      :coordinates="[item.long, item.lat]"
      :selected="selectedEntity?.kind === 'run' && selectedEntity.id === item.id"
      @click="handleRunClick(item)"
    />
  </MglMap>
</template>

<style>
@import "maplibre-gl/dist/maplibre-gl.css";

.bg-important-transparent {
  background-color: transparent !important;
}
</style>
