export type MarkerStatus = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

export interface TableauResource {
  id: string
  resource: Resource
  status: MarkerStatus
}

export interface Resource {
  id: string
  name: string
  type: string

}