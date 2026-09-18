<script setup lang="ts">
import type { Run } from '../models/run'
import type { Tracker } from '../models/tracker'

const props = defineProps<{
  entity: Tracker | Run
}>()

const emit = defineEmits<{
  close: []
  reposition: []
  reset: []
}>()

function isRun(entity: Tracker | Run): entity is Run {
  return 'lat' in entity && 'long' in entity && 'hasPatient' in entity
}
</script>

<template>
  <section class="pointer-events-auto w-min-30 rounded-lg bg-white dark:bg-black text-black dark:text-white shadow-2xl backdrop-blur">
    <div class="flex items-start justify-between gap-3 px-4 pt-3 pb-1">
      <div>
        <p class="text-xs uppercase text-slate-600 dark:text-slate-400">
          Details
        </p>
        <h3 class="mt-1 text-lg font-semibold leading-tight">
          {{ isRun(props.entity) ? `Einsatz ${props.entity.nr}` : (props.entity.resource?.resource.name ?? props.entity.name) }}
        </h3>
      </div>
      <button
        type="button"
        class="rounded-full p-1 transition hover:bg-black/10"
        aria-label="Schließen"
        @click="emit('close')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" class="h-5 w-5 fill-black dark:fill-white" fill="currentColor">
          <path d="M5.23 4.15 4.15 5.23 8.92 10l-4.77 4.77 1.08 1.08L10 11.08l4.77 4.77 1.08-1.08L11.08 10l4.77-4.77-1.08-1.08L10 8.92 5.23 4.15Z" />
        </svg>
      </button>
    </div>

    <div v-if="!isRun(props.entity)" class="px-4 py-1">
      <p v-if="!props.entity.resource?.unsetPosition" class="font-bold text-red-500">
        Position manuell überschrieben!
      </p>
    </div>

    <div class="flex flex-row px-4 pb-4">
      <button
        v-if="!isRun(props.entity)"
        class="rounded-xl bg-orange-400 p-2 font-medium text-slate-950 transition hover:bg-orange-500"
        @click="emit('reset')"
      >
        Override zurücksetzen
      </button>

      <div class="grow px-2" />

      <button
        type="button"
        class="rounded-xl bg-cyan-500 p-2 font-medium text-slate-950 transition hover:bg-cyan-400"
        @click="emit('reposition')"
      >
        Neu positionieren
      </button>
    </div>
  </section>
</template>
