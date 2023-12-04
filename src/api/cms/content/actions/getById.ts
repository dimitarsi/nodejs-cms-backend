import { FastifyInstance } from "fastify"
import getContentCaseFrom from "~/cases/content"
import { schemaRef } from "~/schema/cms-api"

const getByIdOptions = {
  schema: {
    params: schemaRef("idOrSlugParamStrict"),
  },
}

export default function (instance: FastifyInstance) {
  instance.get<{
    Params: { idOrSlug: string }
  }>("/contents/:idOrSlug", getByIdOptions, async (request, reply) => {
    const useCase = getContentCaseFrom(instance)
    const entity = await useCase.byId(request.params.idOrSlug, {
      validateData: true,
    })

    if (entity) {
      reply.send(entity)
    } else {
      reply.code(404).send({
        message: "Not found",
      })
    }
  })
}
