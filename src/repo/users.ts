import { UserWithPermissions as User } from "~/models/user"
import makeRepo from "./crud"
import { Db, ObjectId } from "mongodb"
import bcrypt from "bcrypt"
import { rounds } from "@config"
import { v4 } from "uuid"
import { getActivationExpirationDate } from "~/helpers/date"

function shouldUpdatePassword(
  data: Partial<User>
): data is Pick<User, "password"> {
  return data.password !== undefined
}

export default function users(db: Db) {
  const collection = db.collection<User>("user")
  const crud = makeRepo(collection)

  return {
    ...crud,
    create: (data: Omit<User, "activationHash" | "hashExpiration">) => {
      return crud.create({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        isActive: data.isActive,
        isAdmin: data.isAdmin,
        password: bcrypt.hashSync(data.password, rounds),
        activationHash: v4(),
        hashExpiration: getActivationExpirationDate(),
      })
    },
    update: (
      id: string | number,
      data: Pick<User, "firstName" | "lastName"> | Pick<User, "password">
    ) => {
      // When updating the password, it needs to be encrypted
      if (!shouldUpdatePassword(data)) {
        return crud.update(id, data)
      }

      // Update only the password field
      return crud.update(id, {
        password: bcrypt.hashSync(data.password, rounds),
      })
    },
    selfActivate: async (id: string, hash: string) => {
      return await collection.findOneAndUpdate(
        {
          _id: new ObjectId(id),
          activationHash: hash,
          hashExpiration: { $gt: new Date() },
        },
        {
          $set: { isActive: true },
        }
      )
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
