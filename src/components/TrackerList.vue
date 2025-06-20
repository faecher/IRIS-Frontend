<script setup lang="ts">
import {useConnectionStore} from "../store/connection.ts";

const connectionStore = useConnectionStore();
</script>

<template>
  <div class="maplibregl-ctrl-top-left ">
    <div class="maplibregl-ctrl maplibregl-ctrl-group">
      <p class="font-semibold">Tracker:</p>
      <button v-for="tracker in connectionStore.markers" onclick="console.log('test')">
        {{ tracker.name }}
      </button>
    </div>
  </div>
</template>

<style scoped>

</style>