import { FastifyInstance, RouteShorthandOptions } from "fastify"
import { schemaRef } from "~/schema/cms-api"

const getAllOptions: RouteShorthandOptions = {
  schema: {
    querystring: schemaRef("pageQuery"),
  },
}

export function getAllUsers(instance: FastifyInstance) {
  instance.get("/users", getAllOptions, async (_req, reply) => {
    const users = await instance.users.getAll()

    reply.send(users)
  })
}
