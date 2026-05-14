<script setup lang="ts">
import type { Map as MaplibreMap, StyleSpecification } from 'maplibre-gl'
import type { Tracker } from '../models/tracker.ts'
import { MglMap, MglNavigationControl } from '@indoorequal/vue-maplibre-gl'
import { colorful } from '@versatiles/style'
import { computed, onMounted, ref, watch } from 'vue'
import { useConnectionStore } from '../store/connection.ts'
import { useSettingsStore } from '../store/settings.ts'
import Marker from './Marker.vue'
import 'maplibre-gl/dist/maplibre-gl.css'

const settingsStore = useSettingsStore()
const connectionStore = useConnectionStore()

const versatilesServerURL: string = `http://${window.location.host}`

// Define the styles
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

onMounted(() => {
  // Note: Deep watching is required as vue does not detect the changes in the list
  watch(() => connectionStore.flyTo, () => {
    if (connectionStore.flyTo.length > 0) {
      map.value?.map?.flyTo({
        center: connectionStore.flyTo[0],
      })
      // Remove the first element from the list
      connectionStore.flyTo.shift()
    }
  }, { deep: true })
})

const mapStyle = computed(() => {
  if (settingsStore.useVectorTiles) {
    return vectorTilesStyle
  }
  else {
    return osmStyle
  }
})

function toggleMapStyle() {
  settingsStore.useVectorTiles = !settingsStore.useVectorTiles
}

function flyTo(item: Tracker): void {
  map.value?.map?.flyTo({
    center: [item.position.lon, item.position.lat],
  })
}

const filteredTrackers = computed<Tracker[]>(() => {
  if (settingsStore.showUnassignedTrackers) {
    if (settingsStore.showInactiveMarkers) {
      return connectionStore.trackers
    }
    return connectionStore.trackers.filter(marker => marker.resource?.status !== 6)
  }
  else {
    // The setting showInactiveTrackers has no effect here!

    // Show only assigned trackers (where the resource is not null)
    return connectionStore.trackers.filter(marker => marker.resource !== null)
  }
})
</script>

<template>
  <MglMap
    ref="map"
    :map-style="mapStyle"
    :zoom="zoom"
    :center="center"
    height="100vh"
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
    <Marker
      v-for="item in filteredTrackers"
      :key="item.id"
      :name="item.resource?.resource.name ?? item.name"
      :status="item.resource?.status ?? '?'"
      :coordinates="[item.position.lon, item.position.lat]"
      @marker-click="flyTo(item)"
    />
  </MglMap>
</template>

<style>
@import "maplibre-gl/dist/maplibre-gl.css";
</style>
