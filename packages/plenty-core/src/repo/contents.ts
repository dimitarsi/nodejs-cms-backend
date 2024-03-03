import { Db, ObjectId } from "mongodb"
import makeRepo from "~/core/lib/crud"
import { ensureObjectId } from "~/helpers/objectid"
import { ContentWithConfig, UpdateContentPayload } from "~/models/content"
import { ContentType } from "~/models/contentType"

const withUpdateConfigId = (data: Partial<UpdateContentPayload>) => {
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
const unwrapConfigField = <
  T extends { config: Array<ContentType> | ContentType }
>(
  data: T
) => {
  const { config, ...splat } = data

  if (config && Array.isArray(config) && config.length >= 1) {
    return { config: config[0], ...splat }
  }

  return { config, ...splat }
}

export default function contents(db: Db) {
  const crud = makeRepo(db.collection("contents"), {
    softDelete: false,
  })

  const collection = crud.getCollection()
  // TODO: use a config file for the DB names
  const contentTypesDbName = "contentTypes" // crud.collectionName()

  return {
    ...crud,
    create(data: UpdateContentPayload, projectId: ObjectId | string) {
      const normalized = withUpdateConfigId(data)

      return crud.create({
        createdOn: new Date(),
        updatedOn: new Date(),
        active: true,
        ...normalized,
        projectId: ensureObjectId(projectId),
      } as any)
    },
    update(
      id: string,
      projectId: ObjectId | string,
      data: Partial<UpdateContentPayload>
    ) {
      return crud.updateForProject(id, ensureObjectId(projectId), {
        updatedOn: new Date(),
        ...withUpdateConfigId(data),
      })
    },
    async getById(id: string, projectId: ObjectId | string) {
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
            projectId: ensureObjectId(projectId),
          },
        },
        {
          // TODO: ensure configId belongs to the same project
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

      return data.map(unwrapConfigField)[0] as ContentWithConfig
    },
  }
}
