import { Db, ObjectId } from "mongodb"
import createProjectPayload from "./data/createProject"

export default async function seedProjects(db: Db, owner?: ObjectId) {
  const data = [createProjectPayload]

  const projectIds = []

  for await (const project of data) {
    const projectExists = await db
      .collection("projects")
      .findOne({ name: project.name })

    if (!projectExists) {
      const insertedDocument = await db.collection("projects").insertOne({
        ...project,
        ...(owner ? { owner } : {}),
      })

      projectIds.push(insertedDocument.insertedId)
    }
  }

  return projectIds
}
