import type { LngLatLike } from 'maplibre-gl'
import type { Ref } from 'vue'
import type { Tracker } from '../models/tracker.ts'
import axios from 'axios'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useConnectionStore = defineStore('connection', () => {
  const isConnected: Ref<boolean> = ref(true)
  const trackers: Ref<Tracker[]> = ref([])

  const flyTo: Ref<LngLatLike[]> = ref([])

  let interval: any

  function updateTrackers() {
    axios.get('/api/tracker/', {
      timeout: 500,
    }).then((response) => {
      trackers.value = response.data
    }).catch((e) => {
      console.log(e)
    })
  }

  function bindEvents() {
    interval = setInterval(updateTrackers, 1000)
  }

  function clearEvents() {
    clearInterval(interval)
  }

  return { isConnected, bindEvents, clearEvents, updateTrackers, trackers, flyTo }
})
