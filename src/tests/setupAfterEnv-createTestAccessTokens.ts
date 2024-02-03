import createProjectPayload from "~/cli/seed/data/createProject"
import { MongoClient } from "mongodb"

import accessTokens from "~/repo/accessTokens"
import projects from "~/repo/projects"
import users from "~/repo/users"

import seedUsers from "~/cli/seed/users"

export const seedUsersAndAccessTokens = async () => {
  const conn = new MongoClient("mongodb://root:example@localhost:27017")
  const db = await conn.db(process.env.DB_NAME)

  const accessTokensRepo = accessTokens(db)
  const projectsRepo = projects(db)
  const usersRepo = users(db)

  try {
    await usersRepo.deleteAll()
    await accessTokensRepo.deleteAll()

    await seedUsers(db)

    const adminUser = await db.collection("users").findOne({ isAdmin: true })
    const nonAdminUser = await db
      .collection("users")
      .findOne({ isAdmin: false })
    if (!adminUser || !nonAdminUser) {
      console.error("Unable to seed users properly. Exit.")
      throw new Error(
        "Fatal Error when testing. Unable to seed users properly."
      )
    }
    const createAdminToken = await accessTokensRepo.findOrCreateAccessToken(
      adminUser._id,
      {
        isAdmin: true,
      },
      process.env.TEST_ADMIN_ACCESS_TOKEN
    )
    const createNonAdminToken = await accessTokensRepo.findOrCreateAccessToken(
      nonAdminUser._id,
      {
        isAdmin: false,
      },
      process.env.TEST_NON_ADMIN_ACCESS_TOKEN
    )
    const testProject = await projectsRepo.create({
      ...createProjectPayload,
      owner: adminUser._id,
    })
    await db.collection("users").updateOne(
      { _id: adminUser._id },
      {
        $set: {
          projects: [testProject.insertedId],
        },
      }
    )
  } catch (e) {
    console.error(">> Error while setting up access token for tests", e)
  }

  await conn.close()
}
