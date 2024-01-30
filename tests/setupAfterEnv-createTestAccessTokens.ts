import createProjectPayload from "~/cli/seed/data/createProject"
import { MongoClient, ObjectId } from "mongodb"

import accessTokens from "~/repo/accessTokens"
import projects from "~/repo/projects"
import { Project } from "~/models/project"
import seedUsers from "~/cli/seed/users"
;(async () => {
  // const conn = new MongoClient("mongodb://root:example@localhost:27017")
  // const db = await conn.db(process.env.DB_NAME)

  // const repo = accessToken(db)
  // const projectsRepo = projects(db)

  try {
    // await seedUsers(db)
    // const adminUser = await db.collection("users").findOne({ isAdmin: true })
    // const nonAdminUser = await db
    //   .collection("users")
    //   .findOne({ isAdmin: false })
    // if (!adminUser || !nonAdminUser) {
    //   console.error("Unable to seed users properly. Exit.")
    //   throw new Error(
    //     "Fatal Error when testing. Unable to seed users properly."
    //   )
    // }
    // const createAdminToken = await repo.findOrCreateAccessToken(
    //   adminUser._id,
    //   {
    //     isAdmin: true,
    //   },
    //   process.env.TEST_ADMIN_ACCESS_TOKEN
    // )
    // const createNonAdminToken = await repo.findOrCreateAccessToken(
    //   nonAdminUser._id,
    //   {
    //     isAdmin: false,
    //   },
    //   process.env.TEST_NON_ADMIN_ACCESS_TOKEN
    // )
    // const testProject = await projectsRepo.create({
    //   ...createProjectPayload,
    //   owner: adminUser._id,
    // })
    // await db.collection("users").updateOne(
    //   { _id: adminUser._id },
    //   {
    //     $set: {
    //       projects: [testProject.insertedId],
    //     },
    //   }
    // )
  } catch (e) {
    console.error(">> Error while setting up access token for tests", e)
  }

  // await conn.close()
})()
