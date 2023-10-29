import { UserWithPermissions as User } from "~/models/user"
import makeRepo from "./crud"
import { Db, ObjectId } from "mongodb"
import bcrypt from "bcrypt"
import { rounds } from "@config"

export default function users(db: Db) {
  const collection = db.collection<User>("user")
  const crud = makeRepo(collection)

  return {
    ...crud,
    create: (data: User) => {
      return crud.create({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        isActive: data.isActive,
        isAdmin: data.isAdmin,
        password: bcrypt.hashSync(data.password, rounds),
      })
    },
    update: (id: string | number, data: Partial<User>) => {
      // When updating the password, it needs to be encrypted
      if (!data.password) {
        return crud.update(id, data)
      }

      // Update only the password field
      return crud.update(id, {
        // firstName: data.firstName,
        // lastName: data.lastName,
        password: bcrypt.hashSync(data.password, rounds),
      })
    },
    activate: (id: string | number) => {
      collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        {
          $set: { isActive: true },
        }
      )
    },
  }
}

declare module "fastify" {
  interface FastifyInstance {
    users: ReturnType<typeof users>
  }
}
