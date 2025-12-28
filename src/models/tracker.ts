export type MarkerStatus = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

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
