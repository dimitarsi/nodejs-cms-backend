import { FastifyInstance, RouteShorthandOptions } from "fastify"
import { schemaRef } from "~/schema/cms-api"

const getByIdOptions: RouteShorthandOptions = {
  schema: {
    params: schemaRef("idOrSlugParamStrict"),
  },
}

export default function getById(instance: FastifyInstance) {
  instance.get<{
    Params: { idOrSlug: string }
  }>("/users/:idOrSlug", getByIdOptions, async (req, reply) => {
    const result = await instance.users.getById(req.params.idOrSlug)

    if (!result) {
      reply.code(404).send()
      return
    }

    reply.send(result)
  })
}
