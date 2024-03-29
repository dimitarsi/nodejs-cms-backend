import { UserWithPermissions as User } from "~/models/user"
import makeRepo from "~/core/lib/crud"
import { Db, ObjectId, Document, WithId } from "mongodb"
import bcrypt from "bcrypt"
import { rounds } from "@config"
import { v4 } from "uuid"
import { getActivationExpirationDate } from "~/helpers/date"
import { ensureObjectId } from "~/helpers/objectid"

function shouldUpdatePassword(
  data: Partial<User>
): data is Pick<User, "password"> {
  return data.password !== undefined
}

export default function users(
  db: Db,
  options: Parameters<typeof makeRepo>[1] = { softDelete: false }
) {
  const collection = db.collection<User>("users")
  const crud = makeRepo(collection, options)

  return {
    ...crud,
    getById: async (idOrSlug: string | number | ObjectId) => {
      return (await crud.getById(idOrSlug, { password: 0 })) as WithId<User>
    },
    getByEmail: (email: string) => {
      return collection.findOne({ email })
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
        return {
          status: "duplicated",
          userId: null,
        }
      }

      const result = await crud.create({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        isActive: data.isActive,
        // isAdmin: data.isAdmin,
        password: bcrypt.hashSync(data.password, rounds),
        activationHash: v4(),
        hashExpiration: getActivationExpirationDate(),
        projects: data.projects,
      })

      return {
        status: result.acknowledged ? "ok" : "error",
        userId: result.insertedId,
      }
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
          _id: ensureObjectId(id),
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
    setProjectOwner(userId: string, projectId: string) {
      return collection.findOneAndUpdate(
        {
          _id: new ObjectId(userId),
        },
        {
          $push: { projects: ensureObjectId(projectId) },
        }
      )
    },
  }
}
