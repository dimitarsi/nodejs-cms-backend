import { RequestHandler, Router } from "express"
import db from "@db"

const router = Router()

const handler: (options: { isAdmin: boolean }) => RequestHandler =
  (options) => async (req, res, next) => {
    let accessToken = ""
    let activeToken = null

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
      activeToken = await db.collection("accessTokens").findOne({
        token: accessToken,
        expire: { $gt: new Date() },
        isActive: true,
        isAdmin: options.isAdmin,
      })
    }

    if (activeToken) {
      next()
    } else {
      res.statusCode = 401
      res.json({
        error: "Unauthorized",
      })
    }
  }

export default (options: { isAdmin: boolean }) => router.use(handler(options))
