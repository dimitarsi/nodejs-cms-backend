import { ObjectId, type Db } from "mongodb"
import type { Project } from "~/models/project"
import makeRepo from "~/core/lib/crud"

export default function projects(db: Db) {
  const collection = db.collection<Project>("projects")
  const crud = makeRepo(collection)

  return {
    ...crud,
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
  }
}

function ensureObjectId(id: ObjectId | string) {
  return typeof id === "string" ? new ObjectId(id) : id
}
