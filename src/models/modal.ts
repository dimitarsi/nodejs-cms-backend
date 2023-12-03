import { ObjectId } from "mongodb"

export interface BaseModel {
  _id?: string | ObjectId
  createdOn: Date
  updatedOn: Date
  active: boolean
}
