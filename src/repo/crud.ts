import { Collection, ObjectId } from "mongodb"
import db from "../connect/db"

const baseCrudMethods = <T>(
  collection: Collection,
  options = { softDelete: false }
) => {
  const notDeleted = options.softDelete
    ? { $or: [{ deletedOn: null }, { deletedOn: { $exists: false } }] }
    : {}

  return {
    async getAll(page = 1, pageSize = 20) {
      const cursor = await collection.find(notDeleted, {
        skip: pageSize * (page - 1),
        limit: pageSize,
      })

      const data = await cursor.toArray()
      cursor.close()

      return data
    },
    async create(data: Partial<T>) {
      return await collection.insertOne(data)
    },
    async update(id: string | number, data: Partial<T>) {
      return await collection.updateOne(
        { _id: new ObjectId(id), ...notDeleted },
        { $set: data }
      )
    },
    async deleteById(id: string | number) {
      if (options.softDelete) {
        return await collection.updateOne(
          { _id: new ObjectId(id) },
          {
            $set: { deletedOn: new Date() },
          }
        )
      }
      return await collection.deleteOne({ _id: new ObjectId(id) })
    },
    async getById(id: string | number) {
      return await collection.findOne({ _id: new ObjectId(id), ...notDeleted })
    },
  }
}

const defaultExtend = (
  crudMethods: ReturnType<typeof baseCrudMethods>,
  _collection: Collection
) => crudMethods

export type BaseRepoMethods<T> = ReturnType<typeof baseCrudMethods<T>>

export default <T extends Object>(
  collectionName: string,
  options = { softDelete: false },
  extend = defaultExtend
): ReturnType<typeof extend> => {
  const collection = db.collection(collectionName)
  const crudMethods = baseCrudMethods<T>(collection, options)

  return extend(crudMethods, collection)
}
