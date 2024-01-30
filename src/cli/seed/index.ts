import { Db, ObjectId } from "mongodb"
import { createContent } from "./content"
import { seedContentTypes } from "./contentTypes"
import seedUsers from "./users"
import seedProjects from "./projects"
import { ensureObjectId } from "~/helpers/objectid"

export default async function seed(db: Db) {
  let projectId: ObjectId | null = null
  try {
    const userIds = await seedUsers(db)
    const adminUser = await db.collection("users").findOne({ isAdmin: true })
    const nonAdminUser = await db
      .collection("users")
      .findOne({ isAdmin: false })

    if (adminUser?._id) {
      const projectIds = await seedProjects(db, adminUser?._id)
      projectId = projectIds?.[0] || null

      await db.collection("users").updateOne(
        {
          _id: adminUser._id,
        },
        {
          projectIds: projectIds.map(ensureObjectId),
        }
      )
    }
  } catch (e) {
    console.error("Failed to seed users")
  }

  try {
    // TODO: create contentType of the seeded project
    const finalContentType = await seedContentTypes(db)
    console.log("Content types seeded successfuly")

    for (let i = 0; i < 100; i++) {
      const configId = finalContentType?.insertedId
      if (configId) {
        // TODO: create content of the seeded project
        await createContent(db)(
          configId,
          `Seed Post ${(i + 1).toString().padStart(2, "0")}`
        )

        console.log("New Content Added - " + (i + 1))
      }
    }
  } catch (e) {
    console.error("Failed to seed components")
  }
}
