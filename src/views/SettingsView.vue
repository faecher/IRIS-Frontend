<script setup lang="ts">
import type { Ref } from 'vue'
import type { Operation } from '../models/operation.ts'
import type { Tracker } from '../models/tracker.ts'
import axios from 'axios'
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import StringInput from '../components/StringInput.vue'
import TrackerListItem from '../components/TrackerListItem.vue'
import { useSettingsStore } from '../store/settings.ts'

const settingsStore = useSettingsStore()

const hasError: Ref<boolean> = ref<boolean>(false)
const errors: Ref<string[]> = ref<string[]>([])

const api_key: Ref<string> = ref<string>('')
const url: Ref<string> = ref<string>('')
const enabled: Ref<boolean> = ref<boolean>(false)
const operationSelected: Ref<boolean> = ref<boolean>(false)
const selectedOperation: Ref<string> = ref<string>('')

const operations: Ref<Operation[]> = ref<Operation[]>([])
const trackers: Ref<Tracker[]> = ref<Tracker[]>([])

function addError(msg: string) {
  hasError.value = true
  errors.value.push(msg)
}

function clearError() {
  hasError.value = false
  errors.value = []
}

function loadMCPConfig() {
  // Try loading data
  axios.get(`/api/mcp/config`, {
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((response) => {
    // Update the data on a successful response
    enabled.value = response.data.enabled
    api_key.value = response.data.api_key
    url.value = response.data.url
    operationSelected.value = response.data.operation_selected
    selectedOperation.value = response.data.operation
    clearError()

    if (enabled.value) {
      // Load MCP operations if there is an MCP connection
      loadMCPOperations()
      if (operationSelected.value) {
        loadTrackers()
      }
    }
  }).catch(() => {
    addError('Das Backend kann nicht erreicht werden!')
    console.log('Can\'t query data!')
  })
}

function loadMCPOperations() {
  // Try loading data
  axios.get(`/api/mcp/operations`, {
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((response) => {
    // Update the data on a successful response
    operations.value = response.data
    clearError()
  }).catch(() => {
    addError('Cannot retrieve operations from backend!')
    console.log('Can\'t query data!')
  })
}

function loadTrackers() {
  trackers.value = []
  // Try loading data
  axios.get(`/api/tracker/`, {
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((response) => {
    // Update the data on a successful response
    trackers.value = response.data
    clearError()
  }).catch(() => {
    addError('Cannot retrieve trackers from backend!')
    console.log('Can\'t query data!')
  })
}

function selectOperation(item: Operation) {
  axios.post(`/api/mcp/operations/enable`, {
    uid: item.uid,
  }, {
    headers: {
      'Content-Type': 'application/json',
    },
  }).then(() => {
    // Reload the data
    loadMCPConfig()
    clearError()
  }).catch((e) => {
    console.log(e)
    if (e.status === 400) {
      addError(e.response?.data?.detail)
    }
    else {
      addError('Das Backend kann nicht erreicht werden!')
    }
  })
}

function deselectOperation(item: Operation) {
  axios.post(`/api/mcp/operations/disable`, {
    uid: item.uid,
  }, {
    headers: {
      'Content-Type': 'application/json',
    },
  }).then(() => {
    // Reload the data
    loadMCPConfig()
    clearError()
  }).catch((e) => {
    console.log(e)
    if (e.status === 400) {
      addError(e.response?.data?.detail)
    }
    else {
      addError('Das Backend kann nicht erreicht werden!')
    }
  })
}

function handleMCPSubmit() {
  axios.post(`/api/mcp/start`, {
    url: url.value,
    api_key: api_key.value,
  }, {
    headers: {
      'Content-Type': 'application/json',
    },
  }).then(() => {
    // Reload the data
    loadMCPConfig()
    clearError()
  }).catch((e) => {
    console.log(e)
    if (e.status === 400) {
      addError(e.response?.data?.detail)
    }
    else {
      addError('Das Backend kann nicht erreicht werden!')
    }
  })
}

function resetTrackers() {
  console.warn('Das ist noch nicht implementiert!')
}

onMounted(() => {
  // Load the initial MCP config
  loadMCPConfig()
})
</script>

<template>
  <div class="p-5 min-w-64">
    <RouterLink to="/">
      <p class="text-sm text-blue-800">
        Zurück zur Karte
      </p>
    </RouterLink>
    <h1 class="font-bold text-5xl mt-2 mb-6">
      Einstellungen
    </h1>
    <div
      v-if="hasError"
      class="flex p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400"
      role="alert"
    >
      <div>
        <span class="font-medium">Ein Fehler ist aufgetreten!</span>
        <ul class="mt-1.5 list-disc list-inside">
          <li v-for="error in errors" :key="error">
            {{ error }}
          </li>
        </ul>
      </div>
    </div>
    <h2 class="font-bold text-2xl mb-2">
      MCP-Verbindung
    </h2>
    <p class="mb-2 text-sm font-medium text-gray-900">
      MCP-Integration:
      <span v-if="enabled" class="font-normal">Aktiviert</span>
      <span v-else class="font-normal">Deaktiviert</span>
    </p>
    <form @submit.prevent="handleMCPSubmit">
      <StringInput id="url" v-model="url" label="Server-URL" placeholder="https://127.0.0.1:443" />
      <StringInput id="api_key" v-model="api_key" label="API-Key" />
      <button
        type="submit"
        class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 focus:outline-none"
      >
        Mit MCP verbinden
      </button>
    </form>
    <h2 class="font-bold text-2xl mb-2">
      MCP-Sanitätsdienst
    </h2>
    <div v-if="operations.length === 0 || !enabled">
      <p class="text-gray-500">
        Keine aktiven Sanitätsdienste gefunden!
      </p>
    </div>
    <div v-else>
      <p class="text-gray-900">
        Alle aktiven Sanitätsdienste
      </p>
      <div v-for="operation in operations" :key="operation.uid" class="flex items-center p-1 hover:bg-gray-100">
        <p class="font-semibold text-lg">
          {{ operation.title }}
        </p>
        <p v-if="operation.selected" class="ml-2 text-lg">
          (Ausgewählt)
        </p>
        <div class="grow" />
        <button
          v-if="operation.selected"
          class="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none"
          @click="deselectOperation(operation)"
        >
          Abwählen
        </button>
        <button
          v-else
          class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none"
          @click="selectOperation(operation)"
        >
          Auswählen
        </button>
      </div>
    </div>
    <h2 class="font-bold text-2xl mb-2">
      Tracker-Mapping
    </h2>
    <div v-if="selectedOperation">
      <div v-for="tracker in trackers" :key="tracker.id" class="flex items-center p-1 hover:bg-gray-100">
        <TrackerListItem :item="tracker" @update="loadTrackers" />
      </div>
    </div>
    <div v-else>
      <p>Keine Tracker und keine Resourcen verfügbar</p>
    </div>
    <h2 class="font-bold text-2xl mb-2">
      Tracker zurücksetzen
    </h2>
    <button
      class="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none"
      @click="resetTrackers"
    >
      Tracker und MCP-Teams zurücksetzen
    </button>
    <h2 class="font-bold text-2xl my-4">
      Darstellungseinstellungen
    </h2>
    <div>
      <input
        id="show_unassigned" v-model="settingsStore.showUnassignedTrackers" type="checkbox"
        class="mr-2"
      >
      <label for="show_unassigned">Zeige Tracker auf der Karte an, die nicht mit MCP verknüpft sind</label>
    </div>
    <div>
      <input
        id="show_unassigned" v-model="settingsStore.showInactiveMarkers" type="checkbox"
        class="mr-2"
      >
      <label for="show_unassigned">Zeige inaktive Tracker (Tracker im Status 6) auf der Karte an</label>
    </div>
  </div>
</template>

<style scoped>

</style>
