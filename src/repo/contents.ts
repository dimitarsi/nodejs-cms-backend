import { Db, ObjectId } from "mongodb"
import makeRepo from "~/core/lib/crud"
import { Content } from "~/models/content"

const withUpdateConfigId = (data: Record<string, any>) => {
  const { configId = "", folderLocation, ...splat } = data
  const config = configId ? { configId: new ObjectId(configId) } : {}

  let folderConfig = {}

  return {
    ...folderConfig, // calculates the depth, in case we need it
    ...config,
    ...splat,
  }
}
/**
 * Returns the first item of an array,
 * needed because the aggregate
 * @param data
 * @returns
 */
const unwrapConfigField = (data: Content): Content => {
  const { config, ...splat } = data

  if (config && Array.isArray(config) && config.length >= 1) {
    return { config: config[0], ...splat }
  }

  return { config, ...splat }
}

export default function contents(db: Db) {
  const crud = makeRepo<Content>(db.collection("contents"), {
    softDelete: false,
  })

  const collection = crud.getCollection()
  const contentTypesDbName = crud.collectionName()

  return {
    ...crud,
    create(data: Partial<Omit<Content, "id">>) {
      const normalized = withUpdateConfigId(data)

      return crud.create({
        createdOn: new Date(),
        updatedOn: new Date(),
        active: true,
        ...normalized,
      } as any)
    },
    update(id: string, data: Record<string, any>) {
      return crud.update(id, {
        updatedOn: new Date(),
        ...withUpdateConfigId(data),
      })
    },
    async getAll(
      page = 1,
      options: { perPage: number; filter?: Record<string, any> } = {
        perPage: 20,
      }
    ) {
      const filter = options.filter || {}

      const cursor = await collection.find(filter, {
        skip: options.perPage * (page - 1),
        limit: options.perPage,
      })

      const [items, count] = await Promise.all([
        cursor.toArray(),
        collection.countDocuments(filter),
      ])
      cursor.close()

      const totalPages = Math.ceil(count / options.perPage)

      console.log(">> Items", items.length, count)

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
    async getById(id: string) {
      let query: any = { _id: -1 }

      try {
        query = {
          $or: [{ _id: new ObjectId(id) }, { slug: id }],
        }
      } catch (_e) {
        query = { slug: id }
      }

      const cursor = await collection.aggregate([
        {
          $match: {
            ...query,
          },
        },
        {
          $lookup: {
            from: contentTypesDbName,
            localField: "configId",
            foreignField: "_id",
            as: "config",
          },
        },
      ])

      const data: any[] = await cursor.toArray()
      cursor.close()

      return data.map(unwrapConfigField)[0]
    },
  }
}
