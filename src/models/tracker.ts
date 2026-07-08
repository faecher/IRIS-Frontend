import type { TableauResource } from './resource'

export interface Tracker {
  id: string
  name: string
  battery: number
  position: Position
  lastUpdate: string
  resource: null | TableauResource
  deviceEUI: string
}

export interface Position {
  lon: number
  lat: number
}
