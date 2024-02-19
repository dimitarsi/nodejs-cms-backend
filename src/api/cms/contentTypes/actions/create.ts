import { FastifyInstance } from "fastify"
import { CreateContentType } from "~/models/contentType"
import { schemaRef } from "~/schema/cmsAPISchema"

const createOptions = {
  schema: {
    body: schemaRef("contentTypeCreatePayload"),
    params: {
      type: "object",
      properties: {
        projectId: { type: "string" },
      },
    },
  },
}

export default function createContentType(instance: FastifyInstance) {
  instance.post<{
    Body: CreateContentType
    Params: { projectId: string }
  }>("/:projectId/content-types", createOptions, async (request, reply) => {
    const projectId = request.params.projectId
    const result = await instance.contentTypes.create({
      ...request.body,
      projectId,
    })

    if (result.insertedId) {
      const entity = await instance.contentTypes.getById(result.insertedId)

      reply
        .code(201)
        .header("Location", `/${projectId}/content-types/${result.insertedId}`)
        .send(entity)
    } else {
      reply.code(422).send({
        message: "Cannot create contentType",
      })
    }
  })
}
