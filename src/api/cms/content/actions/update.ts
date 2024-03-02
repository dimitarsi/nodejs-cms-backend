import { FastifyInstance } from "fastify"
import { schemaRef } from "~/schema/cmsAPISchema"
import { CreateContentPayload } from "~/models/content"

const updateOptions = {
  schema: {
    params: schemaRef("idOrSlugAndProjectIdParamStrict"),
    body: schemaRef("contentUpdatePayload"),
  },
}

export default function update(instance: FastifyInstance) {
  instance.patch<{
    Body: CreateContentPayload
    Params: { idOrSlug: string; projectId: string }
  }>(
    "/:projectId/contents/:idOrSlug",
    updateOptions,
    async (request, reply) => {
      const { contentService } = instance.services
      const entity = await contentService.updateContent(
        request.params.idOrSlug,
        request.params.projectId,
        request.body
      )

      if (entity) {
        return reply.code(200).send(entity)
      }

      return reply.code(422).send({
        error: "Unable to update",
        message: "Could not update the entry",
      })
    }
  )
}
