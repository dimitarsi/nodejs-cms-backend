import { FastifyInstance, RouteShorthandOptions } from "fastify"
import { schemaRef } from "~/schema/cms-api"

const getAllOptions: RouteShorthandOptions = {
  schema: {
    querystring: schemaRef("pageQuery"),
  },
}

export function getAllUsers(instance: FastifyInstance) {
  instance.get<{
    Querystring: { page: number; perPage: number }
  }>("/users", getAllOptions, async (req, reply) => {
    const users = await instance.users.getAll(req.query.page, req.query.perPage)

    reply.send(users)
  })
}
