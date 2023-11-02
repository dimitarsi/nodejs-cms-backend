import { FastifyInstance, RouteShorthandOptions } from "fastify"
import { schemaRef } from "~/schema/cms-api"

const getByIdOptions: RouteShorthandOptions = {
  schema: {
    params: schemaRef("idParamStrict"),
  },
}

export default function getById(instance: FastifyInstance) {
  instance.get<{
    Params: { id: string }
  }>("/users/:id", getByIdOptions, async (req, reply) => {
    reply.send(await instance.users.getById(req.params.id))
  })
}
