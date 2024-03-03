import { FastifyInstance } from "fastify"
import { schemaRef } from "~/schema/cmsAPISchema"

const getByIdOptions = {
  schema: {
    params: schemaRef("idOrSlugAndProjectIdParamStrict"),
  },
}

export default function getById(instance: FastifyInstance) {
  instance.get<{
    Params: { idOrSlug: string; projectId: string }
  }>(
    "/:projectId/content-types/:idOrSlug",
    getByIdOptions,
    async (request, reply) => {
      const contentsByid = await instance.contentTypes.getById(
        request.params.idOrSlug,
        request.params.projectId
      )

      if (contentsByid) {
        reply.send(contentsByid)
      } else {
        reply.code(404).send({
          message: "Not found",
        })
      }
    }
  )
}
