<script setup lang="ts">
import type { PropType } from 'vue'
import type { Tracker } from '../models/tracker.ts'
import type { TableauResource } from '../models/resource.ts'
import axios from 'axios'
import { computed, ref, watch } from 'vue'
import BatteryIndicator from './BatteryIndicator.vue'

const props = defineProps({
  tracker: {
	type: Object as PropType<Tracker>,
	required: true,
  },
  resources: {
	type: Array as PropType<TableauResource[]>,
	required: true,
  },
  editingTrackerId: {
	type: String as PropType<string | null>,
	default: null,
  },
})

const emit = defineEmits(['update', 'setEditing'])

const selectedResource = ref<string>(props.tracker.resource?.id ?? '0')

const showDialog = computed(() => props.editingTrackerId === props.tracker.id)
const editedName = ref('')

// Watch for changes in tracker.resource and update the dropdown
watch(() => props.tracker.resource, (newResource) => {
	selectedResource.value = newResource?.id ?? '0'
})


function updateAssignment() {
	var requestRoute = `/api/tracker/assign/${props.tracker.id}`
	if (selectedResource.value != '0') {
		requestRoute += `/${selectedResource.value}`
	}

	axios.post(requestRoute)
	.then(() => {
		// Reload the data
		emit('update')
	}).catch((e) => {
		console.log(e)
	})
}

function saveTrackerName() {
	axios.post(`/api/tracker/rename/${props.tracker.id}`, {
		newName: editedName.value
	})
	.then(() => {
		// Reload the data
		emit('update')
	}).catch((e) => {
		console.log(e)
	})

	emit('setEditing', null)
}

function openEditDialog() {
	editedName.value = props.tracker.name
	emit('setEditing', props.tracker.id)
}

function closeDialog() {
	emit('setEditing', null)
}
</script>


<template>
	<dialog v-if="showDialog" class="rounded-lg shadow-xl p-6 backdrop:bg-black/50" open>
      <h3 class="text-lg font-semibold mb-4">Tracker umbenennen</h3>
      <input 
        v-model="editedName" 
        type="text" 
        class="w-full p-2 border rounded mb-4"
        @keyup.enter="saveTrackerName"
      >
      <div class="flex gap-2 justify-end">
        <button @click="closeDialog" class="px-4 py-2 bg-gray-200 rounded hover:cursor-pointer">
          Abbrechen
        </button>
        <button @click="saveTrackerName" class="px-4 py-2 bg-blue-500 text-white rounded hover:cursor-pointer">
          Speichern
        </button>
      </div>
    </dialog>


	<div class="flex flex-col p-3 bg-gray-800 border border-gray-600 rounded-lg gap-2 h-full">
		<div>
			<!-- TODO: edit icon hinter den namen -> nehmen wir eif. phosphor icons? -->
			<div class="flex justify-between items-top">
				<div class="font-semibold text-white text-xl leading-none hover:cursor-pointer"  @click="openEditDialog">
					{{ tracker.name || "Tracker ohne Namen" }}
				</div> 
				<div class="flex items-center gap-0">
					<BatteryIndicator :value="tracker.battery" />
				</div>
			</div>
			<p class="text-gray-400 text-sm">{{ tracker.deviceEUI }}</p>
			<!-- <div class="text-white">Debug-Data: {{ props.tracker }}</div> -->
		</div>

		<select v-model="selectedResource"
		class="bg-gray-50 border border-gray-400 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 mr-2"
		@change="updateAssignment"
		>
		  <option :value="'0'">
			keine Zuweisung
		  </option>
		  <option v-for="tableauResource in props.resources" :key="tableauResource.id" :value="tableauResource.id">
			{{ tableauResource.resource.name }} ({{ tableauResource.resource.type }}, S{{ tableauResource.status }})
		  </option>
		</select>
	</div>
</template>

<style scoped>

</style>
