import { RequestHandler, Router } from "express"
import db from "@db"
import type { ObjectId, WithId } from "mongodb"
import { getExpirationDate } from "~/repo/accessTokens"

const router = Router()
type ActiveTokenMinType = WithId<{ expire: Date }>

const extendSession = (activeTokenId: ObjectId, minutes: number = 15) => {
  try {
    db.collection("accessTokens").updateOne(
      {
        _id: activeTokenId,
      },
      {
        $set: {
          expire: getExpirationDate(),
        },
      }
    )
  } catch (e: any) {
    console.error(`Could NOT update user session, reason ${e}`)
  }
}

const handler: (options: { isAdmin: boolean }) => RequestHandler =
  (options) => async (req, res, next) => {
    let accessToken = ""
    let activeToken: ActiveTokenMinType | null = null

    if (req.method === "GET" || req.headers["x-access-token"]) {
      const accessTokenHeader = req.headers["x-access-token"]
      accessToken =
        (Array.isArray(accessTokenHeader)
          ? accessTokenHeader[0]
          : accessTokenHeader) || ""
    }

    if (!accessToken && req.body.accessToken) {
      accessToken = `${req.body.accessToken}`
    }

    if (accessToken) {
      activeToken = await db
        .collection<ActiveTokenMinType>("accessTokens")
        .findOne({
          token: accessToken,
          expire: { $gt: new Date() },
          isActive: true,
          isAdmin: options.isAdmin,
        })
    }

    if (activeToken) {
      extendSession(activeToken._id, 15)
      next()
    } else {
      res.status(401).json({
        error: "Unauthorized",
      })
    }
  }

export default (options: { isAdmin: boolean }) => router.use(handler(options))
