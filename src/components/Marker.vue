<script setup lang="ts">
import type { MarkerStatus } from '../models/resource.ts'
import { computed } from 'vue'
import { useEmitAsProps } from '../utils.ts'
import { ClickableMarker } from './index.ts'

const props = withDefaults(defineProps<{
  coordinates?: [number, number]
  name: string
  status?: MarkerStatus | string
  kind?: 'tracker' | 'run'
  selected?: boolean
  draggable?: boolean
}>(), {
  coordinates: () => [0, 0],
  status: '?',
  kind: 'tracker',
  selected: false,
  draggable: false,
})

const emits = defineEmits(['click', 'dragstart', 'drag', 'dragend'])

const knownStatuses = new Set<number>([1, 2, 3, 4, 5, 6, 7, 8, 9])
const isUnknownStatus = computed(() => typeof props.status !== 'number' || !knownStatuses.has(props.status))
const isRunMarker = computed(() => props.kind === 'run')
</script>

<template>
  <ClickableMarker :coordinates="props.coordinates" v-bind="useEmitAsProps(emits)" :draggable="props.draggable">
    <template #marker>
      <div
        class="marker-box cursor-pointer bottom-0 -translate-x-1/2"
        :class="{ 'marker-box-run': isRunMarker }"
      >
        <div
          v-if="isRunMarker"
          class="marker-run-status pl-1 pr-1 pt-0.5 pb-0.5 marker-run"
        >
          <p>{{ props.status }}</p>
        </div>
        <div class="marker-text ml-1 mr-1 p-0.5 text-nowrap">
          <p>{{ props.name }}</p>
        </div>
        <div
          v-if="!isRunMarker"
          class="marker-status pl-1 pr-1 pt-0.5 pb-0.5"
          :class="{
            'marker-s1': props.status === 1,
            'marker-s2': props.status === 2,
            'marker-s3': props.status === 3,
            'marker-s4': props.status === 4,
            'marker-s5': props.status === 5,
            'marker-s6': props.status === 6,
            'marker-s7': props.status === 7,
            'marker-s8': props.status === 8,
            'marker-s9': props.status === 9,
            'marker-unknown': isUnknownStatus,
          }"
        >
          <p>{{ props.status }}</p>
        </div>
      </div>
    </template>
  </ClickableMarker>
</template>

<style scoped>
.marker-box {
  position: absolute;
  border-radius: 0.4em;
  display: flex;
  align-items: baseline;
  background-color: #33333d;
  box-shadow: 5px 10px rgba(106, 106, 106, 0.29);
}

.marker-box-run {
  background-color: #9a0000;
}

.marker-box-run:after {
  border-top-color: #9a0000 !important;
}

.marker-box:after {
  content: '';
  position: absolute;
  bottom: 0.1em;
  left: 50%;
  width: 0;
  height: 0;
  border: 0.625em solid transparent;
  border-top-color: #33333d;
  border-bottom: 0;
  margin-left: -0.625em;
  margin-bottom: -0.625em;
}

.marker-text {
  color: #dcdcdc;
  background-color: #33333d;
}

.marker-box-run .marker-text {
  color: #f1f1f1;
  background-color: unset;
}

.marker-status {
  /* Make status indicator bold */
  font-weight: bold;
  border-bottom-right-radius: 0.4em;
  border-top-right-radius: 0.4em;
}

.marker-run-status {
  /* Make status indicator bold */
  font-weight: bold;
  border-bottom-left-radius: 0.4em;
  border-top-left-radius: 0.4em;
}

.marker-s1 {
  background-color: #00ff33;
}

.marker-s2 {
  color: white;
  background-color: #005d2b;
}

.marker-s3 {
  background-color: #fff100;
}

.marker-s4 {
  background-color: #ff0000;
}

.marker-s5 {
  background-color: #c9c9d0;
}

.marker-s6 {
  background-color: #7c7c7c;
}

.marker-s7 {
  background-color: #df07a7;
}

.marker-s8 {
  color: white;
  background-color: #71055c;
}

.marker-unknown {
  color: white;
  background-color: #0b80bf;
}

.marker-run {
  color: #eff6ff;
  background-color: #0f766e;
}
</style>
