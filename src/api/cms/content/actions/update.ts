import { FastifyInstance } from "fastify"
import { schemaRef } from "~/schema/cms-api"
import createContentCaseFrom from "~/cases/content"

const updateOptions = {
  schema: {
    params: schemaRef("idOrSlugParamStrict"),
    body: {
      type: "object",
      properties: {
        name: { type: "string" },
        slug: { type: "string" },
        configId: { type: "string" },
        isFolder: { type: "boolean" },
        folderLocation: { type: "string" },
        folderTarget: { type: "string" },
        children: {
          type: "array",
          items: {
            type: "object",
          },
        },
        data: {
          type: "object",
          nullable: true,
          additionalProperties: true,
          required: [],
        },
      },
      required: [],
      additionalProperties: false,
    },
  },
}

export default function update(instance: FastifyInstance) {
  instance.patch<{
    Body: Record<string, any>
    Params: { idOrSlug: string }
  }>("/contents/:idOrSlug", updateOptions, async (request, reply) => {
    const contents = await createContentCaseFrom(instance)
    const entity = await contents.updateContent(
      request.params.idOrSlug,
      request.body
    )

    if (entity) {
      return reply.code(200).send(entity)
    }

    return reply.code(422).send({
      error: "Unable to update",
      message: "Could not update the entry",
    })
  })
}
