<script setup lang="ts">
import type { Ref } from 'vue'
import type { Operation } from '../models/operation.ts'
import type { Siteplan } from '../models/siteplan.ts'
import type { TableauResource } from '../models/resource.ts'

import axios from 'axios'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import StringInput from '../components/StringInput.vue'
import TrackerListItem from '../components/TrackerListItem.vue'
import { useSettingsStore } from '../store/settings.ts'
import { useConnectionStore } from '../store/connection.ts'

const settingsStore = useSettingsStore()
const connectionStore = useConnectionStore()

const showResetConfirm: Ref<boolean> = ref<boolean>(false)
const hasError: Ref<boolean> = ref<boolean>(false)
const errors: Ref<string[]> = ref<string[]>([])

const api_key: Ref<string> = ref<string>('')
const url: Ref<string> = ref<string>('')
const enabled: Ref<boolean> = ref<boolean>(false)
const selectedOperation: Ref<string> = ref<string>('')
const selectedSiteplan: Ref<string> = ref<string>('')

const operations: Ref<Operation[]> = ref<Operation[]>([])
const siteplans: Ref<Siteplan[]> = ref<Siteplan[]>([])
const resources: Ref<TableauResource[]> = ref<TableauResource[]>([])
const editingTrackerId: Ref<string | null> = ref<string | null>(null)
const sortCriteria: Ref<'name' | 'deviceEUI' | 'battery' | 'resourceName'> = ref('name')
const showArchived: Ref<boolean> = ref<boolean>(false)

// Computed property for sorted trackers
const sortedTrackers = computed(() => {
  return [...connectionStore.trackers].sort((a, b) => {
    let valueA: string | number
    let valueB: string | number

    switch (sortCriteria.value) {
      case 'name':
        // Use deviceEUI as fallback if name is equal
		// but only if both names are empty to group unnamed trackers together
		if (a.name == b.name) {
			valueA = a.deviceEUI
			valueB = b.deviceEUI
			break
		}
        valueA = a.name
        valueB = b.name 
        break
      case 'deviceEUI':
        valueA = a.deviceEUI
        valueB = b.deviceEUI
        break
      case 'battery':
        valueA = a.battery
        valueB = b.battery
        return valueB - valueA // Descending order for battery
      case 'resourceName':
		// sort by name, then deviceEUI if both trackers don't have a resource
		if (!a.resource && !b.resource) {
			if (a.name == b.name) {
				valueA = a.deviceEUI
				valueB = b.deviceEUI
				break
			}
			valueA = a.name
			valueB = b.name
			break
		}
		// group unassigned trackers together by using empty string as fallback for resource name
        valueA = a.resource?.resource.name ?? ''
        valueB = b.resource?.resource.name ?? ''
        break
    }

    return valueA < valueB ? -1 : valueA > valueB ? 1 : 0
  })
})

// Computed property for filtered operations
const filteredOperations = computed(() => {
  if (showArchived.value) {
    return operations.value
  }
  return operations.value.filter(op => !op.archived)
})

function addError(msg: string) {
	hasError.value = true
	errors.value.push(msg)
}

function clearError() {
	hasError.value = false
	errors.value = []
}

/// ------------------------------------------------
/// MCP State Configuration
/// MARK: MCP State
/// ------------------------------------------------

function loadMCPConfig() {
	axios.get(`/api/mcp/config`)
	.then((response) => {
		enabled.value = response.data.enabled
		api_key.value = response.data.api_key
		url.value = response.data.url
		selectedOperation.value = response.data.operation_id
		selectedSiteplan.value = response.data.siteplan_id

		// On enabled MCP connection, load other selection data
		if (enabled.value) {
			loadOperations()
			loadSiteplans(true) // don't show errors here, because it's likely that no operation/siteplan is selected yet
			connectionStore.updateTrackers()
			loadResources()
		}
	}).catch((e) => {
		if (e.response?.status == 500) {
			addError("Fehler beim Laden der MCP-Konfiguration")
		}

		console.log("Error querying MCP config:",  e)
	})
}

function loadOperations() {
	axios.get(`/api/mcp/operations`)
	.then((response) => {
		operations.value = response.data
	}).catch((e) => {
		if (e.response?.status == 500) {
			addError("Fehler beim Laden der San-Dienste")
		}

		console.log("Error querying MCP Operations:",  e)
	})
}

function loadSiteplans(muteNoOperationError: boolean = false) {
	axios.get(`/api/mcp/siteplans`)
	.then((response) => {
		siteplans.value = response.data
	}).catch((e) => {
		// TODO: instead of errors, this should be a msg in place of the dropdown
		if (e.response?.status == 428 && !muteNoOperationError) {
			addError("Kein Sanitätsdienst ausgewählt")
			return
		}
		else if (e.response?.status == 422) {
			addError("Dem ausgewählten Sanitätsdienst ist kein Ort zugewiesen")
			return
		}
		
		if (e.response?.status == 500) {
			addError("Fehler beim Laden der Lagepläne")
		}

		console.log("Error querying MCP Siteplans:",  e)
	})
}

function loadResources() {
	axios.get(`/api/resources/`)
	.then((response) => {
		resources.value = response.data
	}).catch((e) => {
		if (e.response?.status == 500) {
			addError("Fehler beim Laden der Ressourcen")
		}

		console.log("Error querying MCP Resources:",  e)
	})
}


function handleMCPSubmit() {
  axios.post(`/api/mcp/start`, {
	url: url.value,
	api_key: api_key.value,
	enabled: true,
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
	if (e.response?.status === 400) {
	  addError(e.response?.data?.detail)
	}
	else if (e.response?.status === 500) {
		addError('Fehler beim Verbinden mit MCP')
	}
	else {
	  addError('Das Backend kann nicht erreicht werden!')
	}
  })
}

function handleOperationChange() {
	if (selectedOperation.value === '') {
		// shouldn't happen, but just in case
		console.warn('No operation selected!')
		return
	}
	
	axios.post(`/api/mcp/operations/set/${selectedOperation.value}`)
	.then(() => {
		loadSiteplans()
	}).catch((e) => {
		console.log(e)
		if (e.response?.status === 400) {
		  addError(e.response?.data?.detail)
		}
		else if (e.response?.status === 500) {
			addError('Fehler beim Setzen des Sanitätsdienstes')
		}
		else {
		  addError('Das Backend kann nicht erreicht werden!')
		}
	})
}

function handleSiteplanChange() {
	if (selectedSiteplan.value === '') {
		// shouldn't happen, but just in case
		console.warn('No siteplan selected!')
		return
	}
	
	axios.post(`/api/mcp/siteplans/set/${selectedSiteplan.value}`)
	.then(() => {
		// nothing to do here
	}).catch((e) => {
		console.log(e)
		if (e.response?.status === 400) {
		  addError(e.response?.data?.detail)
		}
		else if (e.response?.status === 500) {
			addError('Fehler beim Setzen des Lageplans')
		}
		else {
		  addError('Das Backend kann nicht erreicht werden!')
		}
	})
}


/// ------------------------------------------------
/// Tracker Configuration
/// MARK: Tracker Config
/// ------------------------------------------------

function resetTrackers() {
	const promises = []
	
	for (const tracker of connectionStore.trackers) {
		if (!tracker.resource) {
			continue
		}

		const promise = axios.post(`/api/tracker/assign/${tracker.id}`)
		.catch((e) => {
			console.log(e)
			addError('Fehler beim Zurücksetzen der Tracker-Zuweisungen')
		})
		
		promises.push(promise)
	}

	// Reload tracker and resource data after all assignments complete
	Promise.all(promises).then(() => {
		connectionStore.updateTrackers()
		loadResources()
	})

	showResetConfirm.value = false
}

let resourceUpdateInterval: number | null = null

onMounted(() => {
  // Load the initial MCP config
  loadMCPConfig()
  
  // Update resources every 4 seconds
  resourceUpdateInterval = setInterval(() => {
    if (enabled.value) {
      loadResources()
    }
  }, 4000)
})

onUnmounted(() => {
  // Clean up interval when component is destroyed
  if (resourceUpdateInterval !== null) {
    clearInterval(resourceUpdateInterval)
  }
})
</script>


<!--
	MARK: TEMPLATE
-->


<template>
 <div class="flex flex-col gap-4 p-5 min-w-64">
	<RouterLink to="/">
		<p class="text-sm text-blue-800">
			Zurück zur Karte
		</p>
	</RouterLink>


	<h1 class="font-bold text-gray-100 text-3xl">
		Einstellungen
	</h1>


	<div
		v-if="hasError"
		class="flex flex-col p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400"
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
		<button
			type="button"
			class="mt-4 text-sm text-red-800 bg-red-200 hover:bg-red-300 focus:ring-4 focus:ring-red-300 rounded-lg px-3 py-1.5 self-start"
			@click="clearError"
		>
			Fehler schließen
		</button>
	</div>

<div class="bg-gray-800 rounded-lg p-4">
	<h2 class="font-bold text-3xl text-gray-300 mb-4"> MCP Einstellungen </h2>

	<div class="flex gap-5 flex-col md:flex-row">
	<div class="flex-1">
		<h3 class="font-bold text-gray-100 text-2xl mb-2">
		  Verbindung
		</h3>
		<p class="mb-2 text-sm font-medium text-gray-400">
		  Verbindungsstatus:
		  <span v-if="enabled" class="font-normal">Aktiv</span>
		  <span v-else class="font-normal">Inaktiv</span>
		</p>
		<form @submit.prevent="handleMCPSubmit">
		  <StringInput id="url" v-model="url" label="Server-URL" placeholder="https://127.0.0.1:443" />
		  <StringInput id="api_key" v-model="api_key" label="API-Key" type="password" />
		  <button
			type="submit"
			class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 focus:outline-none"
		  >
			Mit MCP verbinden
		  </button>
		</form>
	</div>

	<!-- 
		MARK: San-Dienste 
	 -->
	<div class="flex-1">
		<div>
			<div class="flex gap-4 items-center">
				<h3 class="font-bold text-gray-100 text-2xl mb-2">
				  Sanitätsdienst
				</h3>
				<div class="flex items-center mb-2">
					<input 
						id="hide-archived-checkbox" 
						v-model="showArchived" 
						type="checkbox" 
						class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
					>
					<label for="hide-archived-checkbox" class="ms-2 text-sm font-medium text-gray-400">
						Zeige archivierte
					</label>
				</div>
			</div>

			<div v-if="operations.length === 0 || !enabled">
			  <p class="text-gray-500">
				Keine Sanitätsdienste gefunden!
			  </p>
			</div>
			<div v-else class="mb-4">
			  <select
				id="operation-select"
				v-model="selectedOperation"
				class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
				@change="handleOperationChange"
			  >
				<option v-if="selectedOperation == ''" value="" disabled>
				  -- Bitte wählen --
				</option>
				<option v-for="operation in filteredOperations" :key="operation.id" :value="operation.id">
				  {{ operation.title }}
				</option>
			  </select>
			</div>
		</div>

		<!-- 
			MARK: Lagepläne 
		 -->

		<div>
			<h3 class="font-bold text-gray-100 text-2xl mb-2">
				Lageplan
			</h3>

			<div v-if="siteplans.length === 0 || !enabled">
				<p class="text-gray-500">
					Keine Lagepläne gefunden!
				</p>
			</div>
			<div v-else class="mb-4">
			  <select
				id="siteplan-select"
				v-model="selectedSiteplan"
				class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
				@change="handleSiteplanChange"
			  >
				<option v-if="selectedSiteplan == ''" value="" disabled>
				  -- Bitte wählen --
				</option>
				<option v-for="siteplan in siteplans" :key="siteplan.id" :value="siteplan.id">
				  {{ siteplan.name }}
				</option>
			  </select>
			</div>
		</div>
	</div>
	</div>
</div>

 <!-- 
	MARK: Tracker 
 -->

<div class="bg-gray-800 rounded-lg p-4">
	<div class="flex justify-between items-center mb-4">
		<h2 class="font-bold text-gray-300 text-2xl">
			Tracker-Mapping 
		</h2>

		<div class="flex gap-4 items-center">
			<div class="bg-gray-700 rounded-lg ps-3 flex items-center gap-2">
				Sortieren nach
				<select 
					v-model="sortCriteria" 
					class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2"
				>
					<option value="name">Name</option>
					<option value="deviceEUI">Device EUI</option>
					<option value="battery">Batteriestand</option>
					<option value="resourceName">Name des Einsatzmittels</option>
				</select>
			</div>

			<button
			  class="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-4 py-2 focus:outline-none"
			  @click="showResetConfirm = true"
			>
				Alle Zuweisungen zurücksetzen
			</button>
		</div>

		<dialog v-if="showResetConfirm" class="rounded-lg shadow-xl p-4 bg-gray-700 border-gray-600" open>
	      <h3 class="text-lg font-semibold mb-4 text-white">Willst du wirklich alle Zuweisungen zurücksetzen?</h3>
	      <div class="flex gap-2 justify-end">
	        <button @click="showResetConfirm = false" class="px-4 py-2 bg-gray-400 rounded hover:cursor-pointer">
	          Abbrechen
	        </button>
	        <button @click="resetTrackers" class="px-4 py-2 bg-red-500 text-white rounded hover:cursor-pointer">
	          Zurücksetzen
	        </button>
	      </div>
	    </dialog>
	</div>


	<div v-if="connectionStore.trackers.length > 0" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 mb-4">
	  <TrackerListItem 
		v-for="tracker in sortedTrackers" 
		:key="tracker.id" 
		:tracker="tracker" 
		:resources="resources" 
		:editing-tracker-id="editingTrackerId"
		@update="loadResources"
		@set-editing="editingTrackerId = $event"
	  />
	</div>
	<div v-else>
	  <p>Keine Tracker verfügbar</p>
	</div>
</div>








<div class="bg-gray-800 rounded-lg p-4">
	<h2 class="font-bold text-gray-300 text-2xl my-4">
	  Darstellungseinstellungen
	</h2>

	<div>
	  <input
		id="show_unassigned" v-model="settingsStore.showUnassignedTrackers" type="checkbox"
		class="mr-2"
	  >
	  <label for="show_unassigned" class="text-gray-300">Zeige Tracker auf der Karte an, die nicht mit MCP verknüpft sind</label>
	</div>

	<div>
		<input
		id="show_inactive" v-model="settingsStore.showInactiveMarkers" type="checkbox"
		class="mr-2"
		>
		<label for="show_inactive" class="text-gray-300">Zeige inaktive Tracker (Tracker im Status 6) auf der Karte an</label>
	</div>
</div>





<div class="bg-gray-800 rounded-lg p-4">
	<h2 class="font-bold text-gray-300 text-2xl">
		About
	</h2>
	<p>
		IRIS (Information Relay and Integration System) is a FAECHER-Project developed information system for emergency response coordination.
	</p>


	<div>
		<h3 class="font-bold text-gray-300 text-xl my-4">
			IRIS-Server
		</h3>
		
		<p>
			The IRIS-Server is the backend component of IRIS. It is responsible for managing the connection to MCP, storing the tracker data and serving the API for the frontend.
			The server is developed in Go and can be found <a href="https://github.com/faecher/IRIS-Server" class="text-blue-600 hover:underline">on GitHub</a>.
			<br>
			Thank you to all 3rd party libraries and open source projects that made this possible!
		</p>

		<ul class="list-disc p-2 ps-5">
			<li><a href="https://github.com/gin-gonic/gin" class="text-blue-600 hover:underline">Gin Web Framework</a></li>
			<li><a href="https://github.com/jackc/pgx/v5" class="text-blue-600 hover:underline">pgx</a></li>
			<li><a href="https://github.com/chirpstack/chirpstack/api/go/v4" class="text-blue-600 hover:underline">ChirpStack API</a></li>
			<li><a href="https://github.com/gofrs/uuid/v5" class="text-blue-600 hover:underline">UUID</a></li>
			<li><a href="https://github.com/swaggo/swag" class="text-blue-600 hover:underline">Swaggo</a></li>
			<li><a href="https://grpc.io/" class="text-blue-600 hover:underline">gRPC</a></li>
			<li><a href="https://developers.google.com/protocol-buffers" class="text-blue-600 hover:underline">Protobuf</a></li>
		</ul>
	</div>

	<div>
		<h3 class="font-bold text-gray-300 text-xl my-4">
			IRIS-Frontend
		</h3>
		<p>
			The IRIS-Frontend is the frontend component of IRIS. It is responsible for providing the user interface and interacting with the IRIS-Server API.
			The frontend is developed in Vue.js and can be found <a href="https://github.com/faecher/IRIS-Frontend" class="text-blue-600 hover:underline">on GitHub</a>.
			<br>
			Thank you to all 3rd party libraries and open source projects that made this possible!
		</p>
		<ul class="list-disc p-2 ps-5">
			<li><a href="https://vuejs.org/" class="text-blue-600 hover:underline">Vue.js</a></li>
			<li><a href="https://router.vuejs.org/" class="text-blue-600 hover:underline">Vue Router</a></li>
			<li><a href="https://maplibre.org/" class="text-blue-600 hover:underline">MapLibre GL</a></li>
			<li><a href="https://indoorequal.github.io/vue-maplibre-gl/" class="text-blue-600 hover:underline">Vue MapLibre GL</a></li>
			<li><a href="https://pinia.vuejs.org/" class="text-blue-600 hover:underline">Pinia</a></li>
			<li><a href="https://axios-http.com/" class="text-blue-600 hover:underline">Axios</a></li>
			<li><a href="https://vitejs.dev/" class="text-blue-600 hover:underline">Vite</a></li>
			<li><a href="https://tailwindcss.com/" class="text-blue-600 hover:underline">Tailwind CSS</a></li>
			<li><a href="https://www.typescriptlang.org/" class="text-blue-600 hover:underline">TypeScript</a></li>
		</ul>
	</div>

	<h3 class="font-bold text-gray-300 text-xl my-4">
		Other software components
	</h3>
	<p>IRIS wouldn't be possible without these other components:</p>
	<ul class="list-disc p-2 ps-5">
		<li><a href="https://www.postgresql.org/" class="text-blue-600 hover:underline">PostgreSQL</a></li>
		<li><a href="https://versatiles.org/" class="text-blue-600 hover:underline">Versatiles</a></li>
	</ul>
</div>


</div>
</template>





<style scoped>
</style>
