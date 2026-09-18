import type { AxiosError } from 'axios'
import type { LngLatLike } from 'maplibre-gl'
import type { Ref } from 'vue'
import type { Run } from '../models/run.ts'
import type { Tracker } from '../models/tracker.ts'
import axios from 'axios'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useConnectionStore = defineStore('connection', () => {
  const isConnected: Ref<boolean> = ref(false)
  const trackers: Ref<Tracker[]> = ref([])
  const runs: Ref<Run[]> = ref([])

  const flyTo: Ref<LngLatLike[]> = ref([])

  let interval: any

  function updateMCPConfiguration() {
    axios.get('/api/mcp/config', {
      timeout: 500,
    }).then((response) => {
      isConnected.value = response.data.enabled
    }).catch((e: AxiosError) => {
      console.log(e)
    })
  }

  function updateTrackers() {
    axios.get('/api/tracker/', {
      timeout: 500,
    }).then((response) => {
      trackers.value = response.data
    }).catch((e: AxiosError) => {
      console.log(e)
    })
  }

  function updateRuns() {
    if (isConnected.value) {
      axios.get('/api/runs/', {
        timeout: 500,
      }).then((response) => {
        // Perform the update only if the response is not null due to a bug in the backend
        if (response.data !== null) {
          runs.value = response.data
        }
      }).catch((e) => {
        console.error('Failed to fetch runs:', e)
      })
    }
  }

  function updateRunPosition(runId: string, latitude: number, longitude: number) {
    return axios.post(`/api/runs/${runId}/position`, {
      lat: latitude,
      long: longitude,
    })
  }

  async function updateResourcePosition(resourceId: string, latitude: number, longitude: number) {
    return axios.put(`/api/resources/${resourceId}/position`, {
      lat: latitude,
      long: longitude,
    })
  }

  async function resetResourcePosition(resourceId: string) {
    return axios.post(`/api/resources/${resourceId}/reset-position`)
  }

  function bindEvents() {
    updateTrackers()
    updateRuns()
    interval = setInterval(() => {
      updateMCPConfiguration()
      updateTrackers()
      updateRuns()
    }, 1000)
  }

  function clearEvents() {
    clearInterval(interval)
  }

  return { isConnected, bindEvents, clearEvents, updateTrackers, updateRuns, updateRunPosition, updateResourcePosition, resetResourcePosition, trackers, runs, flyTo }
})
