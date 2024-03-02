import { ObjectId } from "mongodb"

export interface ProjectPermission {
  userId: ObjectId | string
  projectId: ObjectId | string
  read: boolean
  write: boolean
  manage: boolean
}
