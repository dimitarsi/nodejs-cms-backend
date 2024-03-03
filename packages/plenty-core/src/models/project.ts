import type { ObjectId } from "mongodb"

export interface DomainSettings {
  host: string
  defaultLocale: string
  supportedLanguages: string[]
}

export interface Project {
  _id: ObjectId | string
  name: string
  active: boolean
  domains: DomainSettings[]
  owner: ObjectId | string // Ref to user
}
