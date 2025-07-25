<script setup lang="ts">
import { RouterView } from "vue-router";
import { useConnectionStore } from "./store/connection.ts";
import { onMounted, onBeforeUnmount } from "vue";

const connectionStore = useConnectionStore();

onMounted(() => {
  connectionStore.bindEvents();
})

onBeforeUnmount(() => {
  connectionStore.clearEvents();
})

</script>

<template>
  <RouterView />
</template>

<style scoped>
</style>
