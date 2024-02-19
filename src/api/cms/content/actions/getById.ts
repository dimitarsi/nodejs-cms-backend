import { FastifyInstance } from "fastify"
import getContentCaseFrom from "~/cases/content"
import { schemaRef } from "~/schema/cmsAPISchema"

const getByIdOptions = {
  schema: {
    params: schemaRef("idOrSlugAndProjectIdParamStrict"),
  },
}

export default function (instance: FastifyInstance) {
  instance.get<{
    Params: { idOrSlug: string; projectId: string }
  }>(
    "/:projectId/contents/:idOrSlug",
    getByIdOptions,
    async (request, reply) => {
      const useCase = getContentCaseFrom(instance)
      const entity = await useCase.byId(
        request.params.idOrSlug,
        request.params.projectId,
        {
          validateData: true,
        }
      )

      if (entity) {
        reply.send(entity)
      } else {
        reply.code(404).send({
          message: "Not found",
        })
      }
    }
  )
}
