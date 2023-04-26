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

      const [items, count] = await Promise.all([cursor.toArray(), collection.countDocuments()])
      cursor.close()

      const totalPages = Math.ceil(count / pageSize);
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
    async create(data: Partial<T>) {
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
      let query: any = { _id: -1 };
      try {
        query = { _id: new ObjectId(id) }; 
      } catch (_e) {
        query = {slug: id}
      }


      return await collection.findOne({
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
