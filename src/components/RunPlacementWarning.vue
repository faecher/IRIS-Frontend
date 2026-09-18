<script setup lang="ts">
import type { Run } from '../models/run'

defineProps<{
  run: Run
  active: boolean
}>()

const emit = defineEmits<{
  place: []
}>()
</script>

<template>
  <section class="pointer-events-auto w-[min(24rem,calc(100vw-2rem))] rounded-lg bg-slate-950/95 text-amber-50 shadow-2xl backdrop-blur">
    <div class="flex justify-between px-4 pt-3 pb-2">
      <div>
        <p class="text-xs uppercase text-amber-200/80">
          Einsatz ohne Position
        </p>
        <h3 class="mt-1 text-base font-semibold leading-tight">
          Einsatz {{ run.nr }}
        </h3>
      </div>
      <button
        type="button"
        class="rounded-full px-2.5 py-1 text-xs font-semibold"
        :class="active ? 'bg-amber-300 text-amber-950 hover:bg-amber-200' : 'bg-white/10 text-amber-50 hover:bg-white/20'"
        @click="emit('place')"
      >
        Auf Karte setzen
      </button>
    </div>

    <div class="px-4 pb-4 pt-2 text-sm text-amber-100">
      <p>
        Dieser Einsatz kann gerade nicht lokalisiert werden.
      </p>
    </div>
  </section>
</template>
