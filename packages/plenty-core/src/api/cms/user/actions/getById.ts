import { FastifyInstance, RouteShorthandOptions } from "fastify"
import { schemaRef } from "~/schema/cmsAPISchema"

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
      return reply.notFound()
    }

    reply.send(result)
  })
}
