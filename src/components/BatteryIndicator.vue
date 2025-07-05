<script setup lang="ts">
defineProps({
  value: {
    type: Number,
    required: true
  }
})
</script>

<template>
<div class="flex items-center">
  <img v-if="value < 12.5" src="/battery_0.svg" alt="Battery charge indicator">
  <img v-else-if="value < 25.0" src="/battery_1.svg" alt="Battery charge indicator">
  <img v-else-if="value < 37.5" src="/battery_2.svg" alt="Battery charge indicator">
  <img v-else-if="value < 50.0" src="/battery_3.svg" alt="Battery charge indicator">
  <img v-else-if="value < 62.5" src="/battery_4.svg" alt="Battery charge indicator">
  <img v-else-if="value < 75.0" src="/battery_5.svg" alt="Battery charge indicator">
  <img v-else-if="value < 87.5" src="/battery_6.svg" alt="Battery charge indicator">
  <img v-else src="/battery_7.svg" alt="Battery charge indicator">
  <p class="w-12 text-right select-none">{{ value }} %</p>
</div>
</template>

<style scoped>

</style>