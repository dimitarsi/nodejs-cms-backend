import { ObjectId } from "mongodb"

export function ensureObjectId(_id: ObjectId | string) {
  return typeof _id === "string" ? new ObjectId(_id) : _id
}
