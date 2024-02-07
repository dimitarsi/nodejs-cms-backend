import { FastifyInstance } from "fastify"
import { schemaRef } from "~/schema/cmsAPISchema"

const getByIdOptions = {
  schema: {
    params: schemaRef("idOrSlugParamStrict"),
  },
}

export default function getById(instance: FastifyInstance) {
  instance.get<{
    Params: { idOrSlug: string }
  }>(
    "/:projectId/content-types/:idOrSlug",
    getByIdOptions,
    async (request, reply) => {
      const contentsByid = await instance.contentTypes.getById(
        request.params.idOrSlug
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
