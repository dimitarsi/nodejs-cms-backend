import { MongoClient } from "mongodb"
import dotenv from "dotenv"

dotenv.config({
  path: ".env.tests",
})

export default async function teardown() {
  const conn = new MongoClient("mongodb://root:example@localhost:27017")
  const db = await conn.db(process.env.DB_NAME)

  const usersCollection = db.collection("users")

  const result = await usersCollection.deleteMany({})

  console.log(">> delete users", { result })

  await conn.close()
}
