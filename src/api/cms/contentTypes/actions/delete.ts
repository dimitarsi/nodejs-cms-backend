import { FastifyInstance } from "fastify"
import { schemaRef } from "~/schema/cmsAPISchema"

const idOrSlugOptions = {
  schema: {
    params: schemaRef("idOrSlugParamStrict"),
  },
}

export default function deleteContentType(instance: FastifyInstance) {
  instance.delete<{
    Params: { idOrSlug: string; projectId: string }
  }>(
    "/:projectId/content-types/:idOrSlug",
    idOrSlugOptions,
    async (request, replay) => {
      await instance.contentTypes.deleteByIdForProject(
        request.params.idOrSlug,
        request.params.projectId
      )

      replay.code(200).send()
    }
  )
}
