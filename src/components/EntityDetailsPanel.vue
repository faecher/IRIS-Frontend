<script setup lang="ts">
import type { Tracker } from '../models/tracker'
import type { Run } from '../models/run'
import BatteryIndicator from './BatteryIndicator.vue'
import LastUpdateIndicator from './LastUpdateIndicator.vue'

const props = defineProps<{
  entity: Tracker | Run
}>()

const emit = defineEmits<{
  close: []
  reposition: []
}>()

function isRun(entity: Tracker | Run): entity is Run {
  return 'lat' in entity && 'long' in entity && 'hasPatient' in entity
}
</script>

<template>
  <section class="pointer-events-auto w-[min(24rem,calc(100vw-2rem))] rounded-2xl border border-white/10 bg-slate-950/95 text-slate-100 shadow-2xl backdrop-blur">
    <div class="flex items-start justify-between gap-3 border-b border-white/10 px-4 py-3">
      <div>
        <p class="text-xs uppercase tracking-[0.24em] text-slate-400">
          Details
        </p>
        <h3 class="mt-1 text-lg font-semibold leading-tight">
          {{ isRun(props.entity) ? 'Einsatz ' + props.entity.nr : (props.entity.resource?.resource.name ?? props.entity.name) }}
        </h3>
      </div>
      <button
        type="button"
        class="rounded-full p-1 text-slate-400 transition hover:bg-white/10 hover:text-white"
        aria-label="Schließen"
        @click="emit('close')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" class="h-5 w-5" fill="currentColor">
          <path d="M5.23 4.15 4.15 5.23 8.92 10l-4.77 4.77 1.08 1.08L10 11.08l4.77 4.77 1.08-1.08L11.08 10l4.77-4.77-1.08-1.08L10 8.92 5.23 4.15Z" />
        </svg>
      </button>
    </div>

    <div class="space-y-3 px-4 py-4 text-sm">
      <div v-if="isRun(props.entity)" class="space-y-2">
        <p class="text-slate-300">
          {{ [props.entity.address, props.entity.obj, props.entity.place].filter(Boolean).join(', ') || 'Keine Ortsangabe' }}
        </p>
        <div class="grid grid-cols-2 gap-2 text-slate-300">
          <div class="rounded-xl bg-white/5 px-3 py-2">
            <p class="text-xs uppercase tracking-wider text-slate-500">
              Patient?
            </p>
            <p class="mt-1 font-medium text-slate-100">
              {{ props.entity.hasPatient ? 'Ja' : 'Nein' }}
            </p>
          </div>
          <div class="rounded-xl bg-white/5 px-3 py-2">
            <p class="text-xs uppercase tracking-wider text-slate-500">
              Koordinaten
            </p>
            <p class="mt-1 font-medium text-slate-100">
              {{ props.entity.lat.toFixed(5) }}, {{ props.entity.long.toFixed(5) }}
            </p>
          </div>
        </div>
      </div>

      <div v-else class="space-y-2">
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-slate-300">
              {{ props.entity.deviceEUI }}
            </p>
            <p class="mt-1 text-slate-400">
              {{ props.entity.resource?.resource.type ?? 'Unzugewiesen' }}
            </p>
          </div>
          <BatteryIndicator :value="props.entity.battery" />
        </div>
        <LastUpdateIndicator :timestamp="props.entity.lastUpdate" />
        <div class="grid grid-cols-2 gap-2 text-slate-300">
          <div class="rounded-xl bg-white/5 px-3 py-2">
            <p class="text-xs uppercase tracking-wider text-slate-500">
              Position
            </p>
            <p class="mt-1 font-medium text-slate-100">
              {{ props.entity.position.lat.toFixed(5) }}, {{ props.entity.position.lon.toFixed(5) }}
            </p>
          </div>
          <div class="rounded-xl bg-white/5 px-3 py-2">
            <p class="text-xs uppercase tracking-wider text-slate-500">
              Zuordnung
            </p>
            <p class="mt-1 font-medium text-slate-100">
              {{ props.entity.resource?.resource.name ?? 'Keine' }}
            </p>
          </div>
        </div>
      </div>

      <div class="flex justify-end pt-2">
        <button
          type="button"
          class="rounded-xl bg-cyan-500 px-4 py-2 font-medium text-slate-950 transition hover:bg-cyan-400"
          @click="emit('reposition')"
        >
          Neu positionieren
        </button>
      </div>
    </div>
  </section>
</template>