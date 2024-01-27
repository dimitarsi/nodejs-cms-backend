import { UserWithPermissions as User } from "~/models/user"
import makeRepo from "~/core/lib/crud"
import { Db, ObjectId, Document } from "mongodb"
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
  const collection = db.collection<User>("users")
  const crud = makeRepo(collection)

  return {
    ...crud,
    getById: (idOrSlug: string | number | ObjectId) => {
      return crud.getById(idOrSlug, { password: 0 })
    },
    getAll: (
      page: number = 1,
      pageSize: number = 20,
      projection?: Document
    ) => {
      return crud.getAll(page, pageSize, {
        password: 0,
        ...(projection || {}),
      })
    },
    create: async (data: Omit<User, "activationHash" | "hashExpiration">) => {
      const user = await collection.findOne({
        email: data.email,
      })

      if (user !== null) {
        return null
      }

      return crud.create({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        isActive: data.isActive,
        isAdmin: data.isAdmin,
        password: bcrypt.hashSync(data.password, rounds),
        activationHash: v4(),
        hashExpiration: getActivationExpirationDate(),
        projects: data.projects,
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
