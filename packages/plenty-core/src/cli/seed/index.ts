import { Db, ObjectId } from "mongodb"
import { createContent } from "./content"
import { seedContentTypes } from "./contentTypes"
import seedUsers from "./users"
import seedProjects from "./projects"

export default async function seed(db: Db) {
  let projectId: ObjectId | null = null
  try {
    console.log(">> Seed users")
    const userIds = await seedUsers(db)
    const adminUser = await db.collection("users").findOne({ isAdmin: true })
    const nonAdminUser = await db
      .collection("users")
      .findOne({ isAdmin: false })

    if (adminUser?._id) {
      console.log(">> Seed projects")
      const projectIds = await seedProjects(db, adminUser?._id)
      projectId = projectIds?.[0] || null

      console.log(">> Update admin user")
      await db.collection("users").updateOne(
        {
          _id: adminUser._id,
        },
        {
          $push: { projects: projectId },
        }
      )
    }
  } catch (e) {
    console.error(e)
    console.error("Failed to seed users `./src/cli/seed/index.ts`")
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
