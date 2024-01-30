import { ObjectId } from "mongodb"

export interface AccessToken {
  token: string
  expire: Date
  userId: ObjectId
  isActive: boolean
  isAdmin: boolean
}
