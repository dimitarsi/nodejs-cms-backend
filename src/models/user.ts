import type { ObjectId } from "mongodb"

export interface User {
  firstName: string
  lastName: string
  email: string
  password: string
  projects: ObjectId[] | string[] // Ref to ProjectSettings
}

export interface UserWithPermissions extends User {
  isActive: boolean
  isAdmin: boolean
  activationHash: string
  hashExpiration: Date
}
