import { type MarkerStatus } from '../ui/marker.ts'

export interface Tracker {
    id: number
    deviceEUI: string
    name: string
    battery: number
    long: number
    lat: number
    lastUpdated: number
    resource: null | Resource
}

export interface Resource {
    id: number
    uid: string
    name: string
    type: string
    status: MarkerStatus
}