import { FastifyInstance } from "fastify"
import { type ContentType } from "~/models/contentType"
import { schemaRef } from "~/schema/cmsAPISchema"

const updateOptions = {
  schema: {
    params: schemaRef("idOrSlugAndProjectIdParamStrict"),
    body: {
      type: "object",
      properties: {
        title: { type: "string" },
        slug: { type: "string" },
        configId: { type: "string" },
        depth: { type: "number" },
      },
      required: [],
      additionalProperties: true,
    },
  },
}

export default function updateContentType(instance: FastifyInstance) {
  instance.patch<{
    Body: Record<string, any>
    Params: { idOrSlug: string; projectId: string }
  }>(
    "/:projectId/content-types/:idOrSlug",
    updateOptions,
    async (request, reply) => {
      const result = await instance.contentTypes.update(
        request.params.idOrSlug,
        request.params.projectId,
        request.body as ContentType
      )

      if (result.matchedCount) {
        return reply.code(200).send()
      }

      return reply.unprocessableEntity()
    }
  )
}
