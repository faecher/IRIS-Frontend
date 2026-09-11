<script setup lang="ts">
import type { Ref } from 'vue'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  timestamp: {
    type: String,
    required: true,
  },
})

const currentTime: Ref<number> = ref(Date.now())
let interval: any

function updateTime() {
  currentTime.value = Date.now()
}

onMounted(() => {
  interval = setInterval(updateTime, 1000)
})

onBeforeUnmount(() => {
  clearInterval(interval)
})

const humanReadableTime = computed(() => {
  const date = new Date(props.timestamp)
  const elapsedTime = currentTime.value - date.getTime()
  return Math.ceil(elapsedTime / 60000)
})
</script>

<template>
  <p v-if="humanReadableTime < 60" class="text-sm text-gray-500 select-none">
    Letztes Update: Vor {{ humanReadableTime }} {{ humanReadableTime < 2 ? 'Minute' : 'Minuten' }}
  </p>
  <p v-else-if="humanReadableTime > 60 && humanReadableTime < 1440" class="text-sm text-gray-500 select-none">
    Letztes Update: Vor {{ Math.ceil(humanReadableTime / 60) }} {{ Math.ceil(humanReadableTime / 60) < 2 ? 'Stunde' : 'Stunden' }}
  </p>
  <p v-else class="text-sm text-gray-500 select-none">
    Letztes Update: Vor {{ Math.ceil(humanReadableTime / 1440) }} {{ Math.ceil(humanReadableTime / 1440) < 2 ? 'Tag' : 'Tagen' }}
  </p>
</template>

<style scoped>

</style>
