import type { FastifyInstance } from "fastify"
import { WithId } from "mongodb"
import { AccessToken } from "~/models/accessToken"

export default function projectAccess(
  instance: FastifyInstance,
  options: { accessLevel: "readOrUp" | "writeOrUp" | "manage" },
  done: Function = () => {}
) {
  instance.addHook<{
    Params: { projectId?: string }
  }>("preHandler", async (req, reply) => {
    const accessTokenHeader = req.headers["x-access-token"]
    const tokenValue =
      (Array.isArray(accessTokenHeader)
        ? accessTokenHeader[0]
        : accessTokenHeader) || ""

    // Find related userId, regardless of access level
    let activeToken: WithId<AccessToken> | null =
      await instance.accessToken.findToken(tokenValue)

    if (!activeToken) {
      return reply.code(403).send({
        error: `Unauthorized - not active token - '${tokenValue}'`,
      })
    }

    const userId = activeToken?.userId
    const projectId = req.params["projectId"] || null

    if (!projectId || !userId) {
      return reply
        .code(500)
        .send({ message: "Resource does not have `projectId` assigned" })
    }

    let hasSufficientAccess = false

    if (options.accessLevel === "readOrUp") {
      hasSufficientAccess = await instance.permissions.hasReadPermission(
        userId,
        projectId
      )
    } else if (options.accessLevel === "writeOrUp") {
      hasSufficientAccess = await instance.permissions.hasWritePermission(
        userId,
        projectId
      )
    } else if (options.accessLevel === "manage") {
      hasSufficientAccess = await instance.permissions.hasManagePermission(
        userId,
        projectId
      )
    }

    if (!hasSufficientAccess) {
      reply.code(403)
      return reply.send({
        error: `Unauthorized - project resource is not permitten to the user`,
      })
    }
  })

  done()
}
