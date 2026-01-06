import type { Ref } from 'vue'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  const useVectorTiles: Ref<boolean> = ref(true)

  const showUnassignedTrackers: Ref<boolean> = ref(true)
  const showInactiveMarkers: Ref<boolean> = ref(true)

  return { useVectorTiles, showUnassignedTrackers, showInactiveMarkers }
}, { persist: true })
