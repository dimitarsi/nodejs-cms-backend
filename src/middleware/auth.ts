// import { RequestHandler, Router } from "express"
// import db from "@db"
// import type { ObjectId, WithId } from "mongodb"
// import { getExpirationDate } from "~/repo/accessTokens"
// import { registerMiddleware } from "~/core/api/router"
import { FastifyInstance } from "fastify"
import { WithId } from "mongodb"
import { AccessToken } from "~/models/accessToken"

// const router = Router()
// type ActiveTokenMinType = WithId<{ expire: Date }>

// const extendSession = (activeTokenId: ObjectId, minutes: number = 15) => {
//   try {
//     db.collection("accessTokens").updateOne(
//       {
//         _id: activeTokenId,
//       },
//       {
//         $set: {
//           expire: getExpirationDate(),
//         },
//       }
//     )
//   } catch (e: any) {
//     console.error(`Could NOT update user session, reason ${e}`)
//   }
// }

// export const handler: (options: { isAdmin: boolean }) => RequestHandler = (
//   options
// ) =>
//   async function auth(req, res, next) {
//     let accessToken = ""
//     let activeToken: ActiveTokenMinType | null = null

//     if (req.method === "GET" || req.headers["x-access-token"]) {
//       const accessTokenHeader = req.headers["x-access-token"]
//       accessToken =
//         (Array.isArray(accessTokenHeader)
//           ? accessTokenHeader[0]
//           : accessTokenHeader) || ""
//     }

//     if (!accessToken && req.body.accessToken) {
//       accessToken = `${req.body.accessToken}`
//     }

//     if (accessToken) {
//       activeToken = await db
//         .collection<ActiveTokenMinType>("accessTokens")
//         .findOne({
//           token: accessToken,
//           expire: { $gt: new Date() },
//           isActive: true,
//           isAdmin: options.isAdmin,
//         })
//     }

//     if (activeToken) {
//       extendSession(activeToken._id, 15)
//       next()
//     } else {
//       res.status(401).json({
//         error: "Unauthorized",
//       })
//     }
//   }

// registerMiddleware("auth:isAdmin", handler({ isAdmin: true }))

export default function (
  instance: FastifyInstance,
  options: { isAdmin: boolean },
  done: Function = () => {}
) {
  instance.addHook("preHandler", async (req, reply) => {
    const accessTokenHeader = req.headers["x-access-token"]
    const tokenValue =
      (Array.isArray(accessTokenHeader)
        ? accessTokenHeader[0]
        : accessTokenHeader) || ""

    let activeToken: WithId<AccessToken> | null

    if (options.isAdmin) {
      activeToken = await instance.accessToken.findAdminToken(tokenValue)
    } else {
      activeToken = await instance.accessToken.findToken(tokenValue)
    }

    if (!activeToken) {
      reply.code(403)
      return reply.send({ error: "Unauthorized" })
    } else {
      instance.accessToken.touchToken(activeToken._id)
    }
  })

  done()
}
