import { Db, ObjectId } from "mongodb"
import makeRepo from "~/core/lib/crud"
import { Content } from "~/models/content"

const withUpdateConfigId = (data: Record<string, any>) => {
  const { configId = "", ...splat } = data
  const config = configId ? { configId: new ObjectId(configId) } : {}

  return {
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
