import { Db, MongoClient } from "mongodb"
import dotenv from "dotenv"

// dotenv.config({
//   path: ".env.tests",
// })

export default async function teardown() {
  const conn = new MongoClient("mongodb://root:example@localhost:27017")
  const db = await conn.db(process.env.DB_NAME)

  console.log(">> DB_NAME", process.env.DB_NAME)

  const usersCollection = db.collection("users")
  const result = await usersCollection.deleteMany({})
  console.log(">> delete users", { result })
  const deleteAccessTokens = await db.collection("accessTokens").deleteMany({})
  console.log(">> delete access tokens", { deleteAccessTokens })
  const deleteProjects = await db.collection("projects").deleteMany({})
  console.log(">> delete projects", { deleteProjects })
  const contentTypes = await db.collection("contentTypes").deleteMany({})
  console.log(">> delete contentTypes", { contentTypes })
  const contents = await db.collection("contents").deleteMany({})
  console.log(">> delete projects", { contents })
  const permissions = await db.collection("permissions").deleteMany({})
  console.log(">> delete permissions", { permissions })
  const invitations = await db.collection("invitations").deleteMany({})
  console.log(">> delete invitations", { invitations })

  conn.close()
}
