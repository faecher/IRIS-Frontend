<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useConnectionStore } from './store/connection.ts'

const connectionStore = useConnectionStore()

onMounted(() => {
  connectionStore.bindEvents()
})

onBeforeUnmount(() => {
  connectionStore.clearEvents()
})
</script>

<template>
  <RouterView />
</template>

<style scoped>
</style>
