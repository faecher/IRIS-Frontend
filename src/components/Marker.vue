<script setup lang="ts">
import {MglMarker} from "@indoorequal/vue-maplibre-gl";
import type {MarkerStatus} from "../models/tracker.ts";

const props = withDefaults(defineProps<{
  coordinates?: [number, number]
  name: string
  status?: MarkerStatus | string,
}>(), {
  coordinates: [0, 0],
  status: "?"
})

const emit = defineEmits(['markerClick'])
</script>

<template>
  <mgl-marker :coordinates="props.coordinates">
    <template v-slot:marker>
      <div class="marker-box cursor-pointer bottom-0 -translate-x-1/2" @click="$emit('markerClick')">
        <div class="marker-text ml-1 mr-1 p-0.5 text-nowrap">
          <p>{{ props.name }}</p>
        </div>
        <div class="marker-status pl-1 pr-1 pt-0.5 pb-0.5 marker-unknown">
          <p>{{ props.status }}</p>
        </div>
      </div>
    </template>
  </mgl-marker>
</template>

<style scoped>

</style>