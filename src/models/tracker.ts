import type { TableauResource } from './resource'

export interface Tracker {
  id: string
  name: string

  battery: number
  long: number
  lat: number

  lastUpdated: string
  resource: null | TableauResource
  
  deviceEUI: string
}


