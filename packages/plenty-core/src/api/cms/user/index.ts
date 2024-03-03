import type { FastifyInstance } from "fastify"
import createUser from "./actions/create"
import deleteUser from "./actions/delete"
import updateUser from "./actions/update"
import activateUser from "./actions/activateUser"
import getById from "./actions/getById"
import { WithId } from "mongodb"
import { AccessToken } from "~/models/accessToken"
// import { getAllUsers } from "./actions/getAll"

export default function (
  instance: FastifyInstance,
  _options: never,
  done: Function
) {
  activateUser(instance)

  // Always allow a new user to be greated - `register`
  createUser(instance)

  instance.register((instance, _options, done) => {
    // Users should be able to update their own info
    instance.addHook<{ Params: { id: string } }>(
      "preHandler",
      async (req, reply) => {
        const accessTokenHeader = req.headers["x-access-token"]
        const tokenValue =
          (Array.isArray(accessTokenHeader)
            ? accessTokenHeader[0]
            : accessTokenHeader) || ""

        let activeToken: WithId<AccessToken> | null

        activeToken = await instance.accessToken.findToken(tokenValue)

        if (
          !activeToken ||
          !req.params?.["id"] ||
          activeToken.userId.toString() !== req.params["id"]
        ) {
          return reply.code(403).send({ message: "Unauthorized" })
        }
      }
    )

    updateUser(instance)
    deleteUser(instance)
    // Get User info if belongs to a project
    getById(instance)

    done()
  })

  // instance.register((instance, _options, done) => {
  //   projectAccess(instance, { accessLevel: "manage" })

  //   // List user of Project
  //   getAllUsers(instance)

  //   done()
  // })

  done()
}
