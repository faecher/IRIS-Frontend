<script setup lang="ts">
import {type Resource, type Tracker} from "../models/tracker.ts";
import {onMounted, type PropType, type Ref, ref} from "vue";
import axios from "axios";
import base from "../api/base.ts";


const props = defineProps({
  item: {
    type: Object as PropType<Tracker>,
    required: true
  },
})

const select = ref<number>(0);

const resources: Ref<Resource[]> = ref<Resource[]>([]);

const emit = defineEmits(['update'])

function loadResources() {
  axios.get(base.root_url + '/api/resources/', {
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(function (response) {
    // Update the data on a successful response
    resources.value = response.data;
    if (props.item.resource !== null) {
      select.value = props.item.resource.id;
    }
  }).catch(function () {
    console.log("Can't query data!")
  })
}

function updateAssigment() {
  axios.post(base.root_url + '/api/tracker/' + props.item.id, {
    resource: select.value === 0 ? null : select.value
  }, {
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(function () {
    // Reload the data
    emit("update");
    loadResources()
  }).catch(function (e) {
    console.log(e)
  })
}

onMounted(() => {
  loadResources()
})

</script>

<template>
  <p class="font-semibold text-lg">{{ item.name }}</p>
  <div class="grow"></div>
  <p>{{ item.deviceEUI }}</p>
  <div class="grow"></div>
  <form class="max-w-sm mx-auto flex items-center" @submit.prevent="updateAssigment">
    <select v-model="select" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 mr-2">
      <option :value="0">Kein zugewiesenes MCP-Team</option>
      <option v-for="resource in resources" :value="resource.id">{{ resource.name }} ({{ resource.type }})</option>
    </select>
    <button
        type="submit"
        class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none">Ändern</button>
  </form>
</template>

<style scoped>

</style>