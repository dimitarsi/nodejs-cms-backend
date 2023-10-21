import db from "@db"
import { randomUUID } from "crypto"
import { loginSession } from "@config"

export const getExpirationDate = () => {
  return new Date(Date.now() + loginSession)
}

export interface AccessToken {
  token: string
  expire: Date
  userId: string
  isActive: boolean
  isAdmin: boolean
}

export const findOrCreateAccessToken = async (
  userId: string,
  data: { isAdmin: boolean | undefined | null }
) => {
  const activeToken = await db.collection<AccessToken>("accessTokens").findOne({
    userId,
    expire: { $gt: new Date() },
    isActive: true,
  })

  if (activeToken) {
    return activeToken.token
  }

  const accessToken = randomUUID()

  await db.collection<AccessToken>("accessTokens").insertOne({
    token: accessToken,
    expire: getExpirationDate(),
    userId,
    isActive: true,
    isAdmin: Boolean(data?.isAdmin),
  })

  return accessToken
}

export const deactivateToken = async (accessToken: string) => {
  const data = await db.collection<AccessToken>("accessTokens").updateOne(
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

export const findToken = async (token: string) => {
  const activeToken = await db.collection<AccessToken>("accessTokens").findOne({
    token,
    expire: { $gt: new Date() },
    isActive: true,
  })

  return activeToken
}

export const deleteAll = async () => {
  return await db.collection<AccessToken>("accessTokens").deleteMany({})
}

export default {
  findOrCreateAccessToken,
  deactivateToken,
  findToken,
  deleteAll,
}
