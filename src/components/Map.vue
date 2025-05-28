<script setup lang="ts">
import 'maplibre-gl/dist/maplibre-gl.css'
import {Map, NavigationControl} from 'maplibre-gl'
import {Marker} from "../ui/marker.ts";
import {onMounted} from 'vue'

let markers = [];

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function demo() {
  for (let i = 0; i < 1000; i++) {
    markers[0].setLngLat([8 + i / 1000, 48.95])
    await sleep(1000);
  }
  console.log('Done');
}


onMounted(() => {
  const map = new Map({
    container: 'map',
    style: 'https://demotiles.maplibre.org/style.json',
    center: [8, 49],
    zoom: 11
  })

  let control = new NavigationControl()
  map.addControl(control)


  //const ref_marker = new Marker()
  //    .setLngLat([8, 48.95])
  //    .addTo(map);

  const marker = new Marker({label: "Test", status: 8})
      .setLngLat([8, 48.95])
      .addTo(map);

  markers.push(marker)

  const marker2 = new Marker()
      .setLngLat([8, 48.951])
      .addTo(map);

  markers.push(marker2)

  //demo()


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