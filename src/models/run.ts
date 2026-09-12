import type { Operation } from './operation'

export interface Run {
  id: string
  operation: Operation
  obj: string
  place: string
  address: string
  lat: number
  long: number
  unsetPosition: boolean
  hasPatient: boolean
  active: boolean
  nr: number
  text?: string
  deleted: boolean
}