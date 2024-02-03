import { Db, MongoClient } from "mongodb"
import dotenv from "dotenv"

// dotenv.config({
//   path: ".env.tests",
// })

export default async function teardown(db: Db) {
  const usersCollection = db.collection("users")
  const result = await usersCollection.deleteMany({})
  console.log(">> delete users", { result })
  const deleteAccessTokens = await db.collection("accessTokens").deleteMany({})
  console.log(">> delete access tokens", { deleteAccessTokens })
  const deleteProjects = await db.collection("projects").deleteMany({})
  console.log(">> delete projects", { deleteProjects })
}
