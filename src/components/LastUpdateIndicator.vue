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
  <p class="text-sm text-gray-500 select-none">
    Letztes Update: Vor {{ humanReadableTime }} {{ humanReadableTime < 2 ? 'Minute' : 'Minuten' }}
  </p>
</template>

<style scoped>

</style>
