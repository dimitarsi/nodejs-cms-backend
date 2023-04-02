import { SchemaValidateFunction } from "ajv"
import db from "../connect/db"
import { ObjectId } from "mongodb"

const checkIfExists: SchemaValidateFunction = async (schema, data) => {
  const [table, field = '_id'] = schema.in.split(':')
  const extra = schema.extra || {}
  const collection = db.collection(table)
  const fieldValue = field === "_id" ? new ObjectId(data) : data;
  const result = await collection.findOne({
    [field]: fieldValue,
    ...extra
  });

  console.log({
    lookFor: {
      [field]: fieldValue,
      ...extra,
    },
    collection: table,
    field
  });

  return result !== null
}

export default checkIfExists