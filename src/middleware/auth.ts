import { type FastifyInstance } from "fastify"
import { type WithId } from "mongodb"
import { type AccessToken } from "~/models/accessToken"

/**
 * @deprecated - user `projectAccess` middleware for fine-grain project oriented user access
 * or repurpose for generic validation if user is logged in
 */
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

    activeToken = await instance.accessToken.findToken(tokenValue)

    // if (options.isAdmin) {
    //   activeToken = await instance.accessToken.findAdminToken(tokenValue)
    // } else {
    //   activeToken = await instance.accessToken.findToken(tokenValue)
    // }

    if (!activeToken) {
      const allTokens = await instance.accessToken.findAll()
      instance.log.info(
        allTokens,
        `debug all tokens - total ${allTokens.length}`
      )
      instance.log.error(
        { token: tokenValue, isAdmin: options.isAdmin },
        "User failed to provide valid token"
      )
      return reply.code(403).send({
        error: `Unauthorized - not active token - '${tokenValue}'`,
      })
    } else {
      instance.accessToken.touchToken(activeToken._id)
    }
  })

  done()
}
