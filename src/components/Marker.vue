<script setup lang="ts">
import type { MarkerStatus } from '../models/resource.ts'
import { MglMarker } from '@indoorequal/vue-maplibre-gl'

const props = withDefaults(defineProps<{
  coordinates?: [number, number]
  name: string
  status?: MarkerStatus | string
}>(), {
  coordinates: () => [0, 0],
  status: '?',
})

const emit = defineEmits(['markerClick'])
</script>

<template>
  <MglMarker :coordinates="props.coordinates">
    <template #marker>
      <div class="marker-box cursor-pointer bottom-0 -translate-x-1/2" @click="emit('markerClick')">
        <div class="marker-text ml-1 mr-1 p-0.5 text-nowrap">
          <p>{{ props.name }}</p>
        </div>
        <div
          class="marker-status pl-1 pr-1 pt-0.5 pb-0.5"
          :class="{ 'marker-s1': props.status === 1,
                    'marker-s2': props.status === 2,
                    'marker-s3': props.status === 3,
                    'marker-s4': props.status === 4,
                    'marker-s5': props.status === 5,
                    'marker-s6': props.status === 6,
                    'marker-s7': props.status === 7,
                    'marker-s8': props.status === 8,
                    'marker-s9': props.status === 9,
                    'marker-unknown': ![1, 2, 3, 4, 5, 6, 7, 8, 9].includes(props.status) }"
        >
          <p>{{ props.status }}</p>
        </div>
      </div>
    </template>
  </MglMarker>
</template>

<style scoped>

</style>
