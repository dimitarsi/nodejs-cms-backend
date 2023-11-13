import { randomUUID } from "crypto"
import { Db, ObjectId } from "mongodb"
import { AccessToken } from "~/models/accessToken"
import { getSessionExpirationDate } from "~/helpers/date"

export default function accessToken(db: Db) {
  const collection = db.collection<AccessToken>("accessTokens")

  const findOrCreateAccessToken = async (
    userId: string,
    data: { isAdmin: boolean | undefined | null },
    accessToken?: string
  ) => {
    const activeToken = await collection.findOne({
      userId,
      expire: { $gt: new Date() },
      isActive: true,
    })

    if (activeToken) {
      return activeToken.token
    }

    const token = process.env.TEST && accessToken ? accessToken : randomUUID()

    await collection.insertOne({
      token,
      expire: getSessionExpirationDate(),
      userId,
      isActive: true,
      isAdmin: Boolean(data?.isAdmin),
    })

    return accessToken
  }

  const deactivateToken = async (accessToken: string) => {
    const data = await collection.updateOne(
      {
        token: accessToken,
        expire: { $gt: new Date() },
        isActive: true,
      },
      {
        $set: { isActive: false },
      }
    )

    return data.modifiedCount > 0
  }

  const findToken = async (token: string) => {
    const activeToken = await collection.findOne({
      token,
      expire: { $gt: new Date() },
      isActive: true,
    })

    return activeToken
  }

  const findAdminToken = async (token: string) => {
    const query = {
      token,
      expire: { $gt: new Date() },
      isActive: true,
      isAdmin: true,
    }
    const activeToken = await collection.findOne(query)

    return activeToken
  }

  const deleteAll = async () => {
    return await collection.deleteMany({})
  }

  const touchToken = async (activeTokenId: ObjectId) => {
    return await collection.updateOne(
      {
        _id: activeTokenId,
        expire: { $gt: new Date() },
      },
      {
        $set: {
          expire: getSessionExpirationDate(),
        },
      }
    )
  }

  return {
    findOrCreateAccessToken,
    deactivateToken,
    findToken,
    deleteAll,
    findAdminToken,
    touchToken,
  }
}
