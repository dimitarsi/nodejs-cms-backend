import Ajv from "ajv"
import { Db } from "mongodb"
import addFormats from "ajv-formats"
import userRepo from "~/repo/users"
import { userCreatePayload } from "~/schema/cms-api"

const ajv = new Ajv()
addFormats(ajv)
const validateUser = ajv.compile(userCreatePayload)

export default async function seedUsers(db: Db) {
  const data = [
    {
      firstName: "Admin",
      lastName: "Root",
      isAdmin: true,
      isActive: true,
      email: "admin@gmail.com",
      password: "1234567890",
      projects: [],
    },
    {
      firstName: "John",
      lastName: "Doe",
      isAdmin: false,
      isActive: true,
      email: "john.doe@gmail.com",
      password: "1234567890",
      projects: [],
    },
  ]

  const users = await userRepo(db)

  for (const userData of data) {
    const valid = await validateUser(userData)

    if (valid) {
      await users.create(userData)
    } else {
      console.error(validateUser.errors)
    }
  }
}
