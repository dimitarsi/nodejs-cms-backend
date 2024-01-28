import { ObjectId } from "mongodb"

export default interface Invitation {
  userEmail: ObjectId | string
  projectId: ObjectId | string
  expires: Date
  token: string
}
