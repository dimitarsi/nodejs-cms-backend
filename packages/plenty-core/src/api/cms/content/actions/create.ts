import type { FastifyInstance } from "fastify"
import { schemaRef } from "~/schema/cmsAPISchema"
import type { CreateContentPayload } from "~/models/content"

const createContentPayload = {
  schema: {
    body: schemaRef("contentCreatePayload"),
    params: schemaRef("projectIdParamStrict"),
  },
}

export default function createContents(instance: FastifyInstance) {
  instance.post<{
    Body: CreateContentPayload
    Params: { projectId: string }
  }>("/:projectId/contents", createContentPayload, async (request, reply) => {
    const body = request.body
    const projectId = request.params.projectId

    const { contentService } = instance.services
    const entity = await contentService.createContent(body, projectId)

    if (entity && entity._id) {
      reply.header("Location", `/${projectId}/contents/${entity._id}`)
      reply.code(201).send(entity)
    } else {
      reply.unprocessableEntity()
    }
  })
}
