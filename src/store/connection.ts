import type { LngLatLike } from 'maplibre-gl'
import type { Ref } from 'vue'
import type { Run } from '../models/run.ts'
import type { Tracker } from '../models/tracker.ts'
import axios from 'axios'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useConnectionStore = defineStore('connection', () => {
  const isConnected: Ref<boolean> = ref(true)
  const trackers: Ref<Tracker[]> = ref([])
  const runs: Ref<Run[]> = ref([])

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

  function updateRuns() {
    axios.get('/api/runs/', {
      timeout: 500,
    }).then((response) => {
      // console.log('Fetched runs:', response.data)
      runs.value = response.data
      // console.log('Runs updated:', runs.value)
    }).catch((e) => {
      console.error('Failed to fetch runs:', e)
    })
  }

  function updateRunPosition(runId: string, latitude: number, longitude: number) {
    return axios.post(`/api/runs/${runId}/position`, {
      lat: latitude,
      long: longitude,
    })
  }

  function bindEvents() {
    updateTrackers()
    updateRuns()
    interval = setInterval(() => {
      updateTrackers()
      updateRuns()
    }, 1000)
  }

  function clearEvents() {
    clearInterval(interval)
  }

  return { isConnected, bindEvents, clearEvents, updateTrackers, updateRuns, updateRunPosition, trackers, runs, flyTo }
})
