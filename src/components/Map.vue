<script setup lang="ts">
import 'maplibre-gl/dist/maplibre-gl.css'
import {Map, NavigationControl, type StyleSpecification} from 'maplibre-gl'
import {Marker} from "../ui/marker.ts";
import {onMounted} from 'vue'
import {useSettingsStore} from "../store/settings.ts";
import {colorful} from "@versatiles/style";
import {useConnectionStore} from "../store/connection.ts";

let markers = [];

const settingsStore = useSettingsStore();
const connectionStore = useConnectionStore();

// Define the styles
const vectorTilesStyle = colorful({
  baseUrl: 'http://127.0.0.1:8080',
  language: 'de'
})

const osmStyle: StyleSpecification = {
  'version': 8,
  'name': 'Raster tiles',
  'center': [0, 0],
  'zoom': 0,
  'sources': {
    'raster-tiles': {
      'type': 'raster',
      'tiles': ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      'tileSize': 256,
      'minzoom': 0,
      'maxzoom': 19
    }
  },
  'layers': [
    {
      'id': 'background',
      'type': 'background',
      'paint': {
        'background-color': '#e0dfdf'
      }
    },
    {
      'id': 'simple-tiles',
      'type': 'raster',
      'source': 'raster-tiles'
    }
  ]
}

onMounted(() => {
  const style = settingsStore.useVectorTiles ? vectorTilesStyle : osmStyle

  const map = new Map({
    container: 'map',
    style: style,
    center: [8.4, 49],
    zoom: 11
  })

  let control = new NavigationControl()
  map.addControl(control)
})
</script>

<template>
  <div id="map"></div>
</template>

<style scoped>
#map {
  height: 100vh;
  width: 100vw;
  position: absolute;
}

</style>