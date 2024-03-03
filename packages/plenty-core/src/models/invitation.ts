import { ObjectId } from "mongodb"

export default interface Invitation {
  userEmail: string
  projectId: ObjectId | string
  expires: Date
  token: string
}
