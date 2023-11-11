import { FastifyInstance } from "fastify"
import { schemaRef } from "~/schema/cms-api"

const updateOptions = {
  schema: {
    params: schemaRef("idOrSlugParamStrict"),
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

export default function update(instance: FastifyInstance) {
  instance.patch<{
    Body: Record<string, any>
    Params: { idOrSlug: string }
  }>("/contents/:idOrSlug", updateOptions, async (request, reply) => {
    const result = await instance.contents.update(
      request.params.idOrSlug,
      request.body
    )

    if (result.matchedCount) {
      return reply.code(200).send()
    }

    return reply.code(422).send({
      error: "Entry to updated",
      message: "Could not update the entry",
    })
  })
}
