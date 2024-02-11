import { ObjectId, type Db } from "mongodb"
import type { Project } from "~/models/project"
import makeRepo from "~/core/lib/crud"

export default function projects(db: Db) {
  const collection = db.collection<Project>("projects")
  const crud = makeRepo(collection)

  return {
    ...crud,
    /**
     * When a project with the same `name` and `owner` is found
     * `create` returns `null` - meaning, no project is created
     */
    async create(data: Parameters<typeof crud.create>[0]) {
      const projectWithSameName = await collection.findOne({
        name: data.name,
        owner: data.owner,
      })

      if (!!projectWithSameName) {
        return null // nothing was created
      }

      return crud.create(data)
    },
    async getAllByIds(ids: string[] | ObjectId[]) {
      const cursor = await collection.find({
        _id: {
          $in: ids.map(ensureObjectId),
        },
      })

      const data = await cursor.toArray()
      cursor.close()

      return data
    },

    async deleteForUser(userId: ObjectId | string) {
      return collection.deleteMany({ owner: ensureObjectId(userId) })
    },
  }
}

function ensureObjectId(id: ObjectId | string) {
  return typeof id === "string" ? new ObjectId(id) : id
}
