import { FastifyInstance } from "fastify"
import getContentCaseFrom from "~/services/content"
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
      const { contentService } = instance.services

      const entity = await contentService.byId(
        request.params.idOrSlug,
        request.params.projectId,
        {
          validateData: true,
        }
      )

      if (!entity) {
        return reply.notFound()
      }

      reply.send(entity)
    }
  )
}
