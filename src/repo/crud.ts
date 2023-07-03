import { Collection, Filter, ObjectId } from "mongodb"
import db from "@db"

const baseCrudMethods = <T extends Record<string, any>>(
  collection: Collection<T>,
  options = { softDelete: false }
) => {
  const notDeleted: Filter<any> = options.softDelete
    ? { $or: [{ deletedOn: null }, { deletedOn: { $exists: false } }] }
    : {}

  return {
    getCollection() {
      return collection
    },
    getDbName() {
      return collection.dbName
    },
    async getAll(page = 1, pageSize = 20) {
      const cursor = await collection.find(notDeleted, {
        skip: pageSize * (page - 1),
        limit: pageSize,
      })

      const [items, count] = await Promise.all([
        cursor.toArray(),
        collection.countDocuments(notDeleted),
      ])
      cursor.close()

      const totalPages = Math.ceil(count / pageSize)
      return {
        items,
        pagination: {
          page,
          perPage: pageSize,
          count,
          totalPage: totalPages,
          nextPage: page >= totalPages ? null : page + 1,
        },
      }
    },
    async create(data: any) {
      return await collection.insertOne(data)
    },
    async update(id: string | number, data: Partial<T>) {
      let query: any = { _id: -1 }
      try {
        query = { _id: new ObjectId(id) }
      } catch (_e) {
        query = { slug: id }
      }

      return await collection.updateOne(
        { ...query, ...notDeleted },
        { $set: data }
      )
    },
    async deleteById(id: string | number) {
      const filterById: Filter<any> = { _id: new ObjectId(id) }

      if (options.softDelete) {
        const updateFilter: any = {
          $set: { deletedOn: new Date() },
        }
        return await collection.updateOne(filterById, updateFilter)
      }
      return await collection.deleteOne(filterById)
    },
    async deleteAll() {
      return await collection.deleteMany({})
    },
    async getById(id: string | number) {
      let query: any = { _id: -1 }
      try {
        query = { _id: new ObjectId(id) }
      } catch (_e) {
        query = { slug: id }
      }

      return await collection.findOne<T>({
        ...query,
        ...notDeleted,
      })
    },
  }
}

export const defaultExtend = (
  crudMethods: ReturnType<typeof baseCrudMethods>,
  _collection: Collection
) => crudMethods

export default <T extends Object>(
  collectionName: string,
  options = { softDelete: false },
) => {
  const collection = db.collection<T>(collectionName)
  return baseCrudMethods<T>(collection, options)
}
