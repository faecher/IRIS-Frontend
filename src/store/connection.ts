import type { LngLatLike } from 'maplibre-gl'
import type { Ref } from 'vue'
import type { Tracker } from '../models/tracker.ts'
import axios from 'axios'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useConnectionStore = defineStore('connection', () => {
  const isConnected: Ref<boolean> = ref(true)
  const markers: Ref<Tracker[]> = ref([])

  const flyTo: Ref<LngLatLike[]> = ref([])

  let interval: any

  function updateData() {
    axios.get('/api/tracker/', {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 500,
    }).then((response) => {
      // Only process JSON data
      if (response.headers['content-type'] !== 'application/json') {
        return
      }
      // Reload the data
      markers.value = response.data

      // Sort trackers according to their name
      markers.value.sort((a, b) => {
        const item_a = a.resource == null ? a.name : a.resource.name
        const item_b = b.resource == null ? b.name : b.resource.name
        if (item_a < item_b) {
          return -1
        }
        else if (item_a > item_b) {
          return 1
        }
        else {
          return 0
        }
      })
    }).catch((e) => {
      console.log(e)
    })
  }

  function bindEvents() {
    interval = setInterval(updateData, 2500)
  }

  function clearEvents() {
    clearInterval(interval)
  }

  return { isConnected, bindEvents, clearEvents, markers, flyTo }
})
