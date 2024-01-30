import {
  Collection,
  Filter,
  ObjectId,
  OptionalUnlessRequiredId,
  Document,
} from "mongodb"

export const baseCrudMethods = <T extends Record<string, any>>(
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
    collectionName() {
      return collection.collectionName
    },
    async getAll(page = 1, pageSize = 20, projection?: Document) {
      let cursor = collection.find(notDeleted, {
        skip: pageSize * (page - 1),
        limit: pageSize,
      })

      // apply projection
      if (projection) {
        cursor = cursor.project(projection)
      }

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
          totalPages,
          nextPage: page >= totalPages ? null : page + 1,
        },
      }
    },
    async searchAll(
      page = 1,
      options: {
        perPage: number
        filter?: Record<string, any>
        projection?: Document
      } = {
        perPage: 20,
      }
    ) {
      const filter = options.filter || {}

      let cursor = await collection.find(filter, {
        skip: options.perPage * (page - 1),
        limit: options.perPage,
      })

      // apply projection
      if (options.projection) {
        cursor = cursor.project(options.projection)
      }

      const [items, count] = await Promise.all([
        cursor.toArray(),
        collection.countDocuments(filter),
      ])
      cursor.close()

      const totalPages = Math.ceil(count / options.perPage)

      return {
        items,
        pagination: {
          page,
          perPage: options.perPage,
          count,
          totalPages,
          nextPage: page >= totalPages ? null : page + 1,
        },
      }
    },
    async create(data: Omit<T, "_id">) {
      return await collection.insertOne(data as OptionalUnlessRequiredId<T>)
    },
    async update(id: ObjectId | string | number, data: Partial<T>) {
      let query: any = { _id: -1 }
      try {
        query = { $or: [{ _id: new ObjectId(id) }, { slug: id }] }
      } catch (_e) {
        query = { slug: id }
      }

      return await collection.updateOne(
        { ...query, ...notDeleted },
        { $set: data }
      )
    },
    async deleteById(id: string | number): Promise<DeleteResult | null> {
      let query: any = { _id: -1 }
      try {
        if (typeof id === "string" || typeof id === "number") {
          query = { _id: new ObjectId(id) }
        } else {
          query = { _id: id }
        }
      } catch (_e) {
        query = { slug: id }
      }

      if (options.softDelete) {
        const updateFilter: any = {
          $set: { deletedOn: new Date() },
        }

        return {
          type: "softDelete",
          result: await collection.updateOne(query, updateFilter),
        }
      }
      return {
        type: "hardDelete",
        result: await collection.deleteOne(query),
      }
    },
    deleteAll() {
      return collection.deleteMany({})
    },
    getById(id: ObjectId | string | number, projection?: Document | undefined) {
      let query: any = { _id: -1 }
      try {
        if (typeof id === "string" || typeof id === "number") {
          query = { _id: new ObjectId(id) }
        } else {
          query = { _id: id }
        }
      } catch (_e) {
        query = { slug: id }
      }

      return collection.findOne<T>(
        {
          ...query,
          ...notDeleted,
        },
        projection ? { projection } : undefined
      )
    },
  }
}

export type DeleteResult =
  | { type: "softDelete"; result: Awaited<ReturnType<Collection["updateOne"]>> }
  | {
      type: "hardDelete"
      result: Awaited<ReturnType<Collection["deleteOne"]>>
    }

export type CrudRepo = ReturnType<typeof baseCrudMethods>

export const defaultExtend = (
  crudMethods: ReturnType<typeof baseCrudMethods>,
  _collection: Collection
) => crudMethods

export default <T extends Object>(
  collection: Collection<T>,
  options = { softDelete: false }
) => {
  return baseCrudMethods<T>(collection, options)
}
