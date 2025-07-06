<script setup lang="ts">
import { RouterView } from "vue-router";
import { useConnectionStore } from "./store/connection.ts";
import { socket } from "./socket.ts";

const connectionStore = useConnectionStore();

// remove any existing listeners
socket.off();

connectionStore.bindEvents()

</script>

<template>
  <RouterView />
</template>

<style scoped>
</style>
