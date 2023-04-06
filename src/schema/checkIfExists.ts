import { SchemaValidateFunction } from "ajv"
import db from "../connect/db"
import { ObjectId } from "mongodb"

interface FoundSchema {
  extra ?: any; 
  in: `${string}:${string}` | string
  notIn?: Boolean
}

export const checkIfExists: SchemaValidateFunction = async (
  schema: FoundSchema,
  data
) => {
  const [table, field = "_id"] = schema.in.split(":")
  const extra = schema.extra || {}
  const collection = db.collection(table)
  const fieldValue = field === "_id" ? new ObjectId(data) : data
  const result = await collection.findOne({
    [field]: fieldValue,
    ...extra,
  })

  return schema.notIn ? result === null : result !== null
}

// export const checkIfNotExists: SchemaValidateFunction = async (
//   schema,
//   data
// ) => {
//   const [table, field = "_id"] = schema.in.split(":")
//   const extra = schema.extra || {}
//   const collection = db.collection(table)
//   const fieldValue = field === "_id" ? new ObjectId(data) : data

//   const result = await collection.findOne({
//     [field]: fieldValue,
//     ...extra,
//   })

//   return result === null
// }
