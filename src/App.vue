<script setup lang="ts">
import { RouterView } from "vue-router";
import { useConnectionStore } from "./store/connection.ts";
import { onMounted } from "vue";

const connectionStore = useConnectionStore();

onMounted(() => {
  // Try connection on application start
  connectionStore.connect();

  if(connectionStore.isConnected) {
    connectionStore.bindEvents()
  }
})

</script>

<template>
  <RouterView />
</template>

<style scoped>
</style>
