<script setup lang="ts">
import 'maplibre-gl/dist/maplibre-gl.css'
import { Map, NavigationControl, type StyleSpecification } from 'maplibre-gl'
import { Marker } from "../ui/marker.ts";
import { onMounted, watch } from 'vue'
import { useSettingsStore } from "../store/settings.ts";
import { colorful } from "@versatiles/style";
import { useConnectionStore } from "../store/connection.ts";
import { SettingControl } from "../ui/setting_control.ts";
import { StyleControl } from "../ui/style_control.ts";

let markers: Marker[] = [];

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

function updateMarkers(map: Map) {
  for (const item of connectionStore.markers) {
    if (markers.some(e => e.getEUI() === item.deviceEUI)) {
      // We found at least one object that we're looking for!
      let marker = markers.find(e => e.getEUI() === item.deviceEUI)

      // Update label if required
      if (item.resource === null) {
        if (marker?.getLabel() !== item.name) {
          marker?.setLabel(item.name)
        }
      } else {
        if (marker?.getLabel() !== item.resource.name) {
          marker?.setLabel(item.resource.name)
        }

        // Update status
        marker?.setStatus(item.resource.status)
      }

      // Update position
      marker?.setLngLat([item.long, item.lat]);

    } else {
      // Create a new marker otherwise
      if (item.resource === null) {
        let marker = new Marker({label: item.name, eui: item.deviceEUI})
        marker.setLngLat([item.long, item.lat])
        marker.addTo(map)
        markers.push(marker)
      } else {
        let marker = new Marker({label: item.resource.name, eui: item.deviceEUI})
        marker.setStatus(item.resource.status)
        marker.setLngLat([item.long, item.lat])
        marker.addTo(map)
        markers.push(marker)
      }
    }
  }
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

  let styleControl = new StyleControl()
  map.addControl(styleControl, 'bottom-right')

  let settingControl = new SettingControl()
  map.addControl(settingControl, 'bottom-right')

  watch(() => settingsStore.useVectorTiles, function () {
      if (settingsStore.useVectorTiles) {
        map.setStyle(vectorTilesStyle)
      } else {
        map.setStyle(osmStyle)
      }
  })

  // Load all markers initially
  updateMarkers(map)

  // Note: Deep watching is required as vue does not detect the changes in the list
  watch(() => connectionStore.flyTo, function () {
    if (connectionStore.flyTo.length > 0) {
      map.flyTo({
        center: connectionStore.flyTo[0]
      })
      // Remove the first element from the list
      connectionStore.flyTo.shift();
    }
  }, { deep: true })

  watch(() => connectionStore.markers, function() {
    console.log("Marker data updated!")
    updateMarkers(map)
  });

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