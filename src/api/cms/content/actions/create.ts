import { FastifyInstance } from "fastify"
import { schemaRef } from "~/schema/cms-api"
import createContentCaseFrom from "~/cases/content/create"

const createContentPayload = {
  schema: {
    body: schemaRef("contentCreatePayload"),
  },
}

export default function createContents(instance: FastifyInstance) {
  instance.post<{
    Body: Record<string, any>
  }>("/contents", createContentPayload, async (request, reply) => {
    const body = request.body
    const contents = await createContentCaseFrom(instance)
    const entity = await contents.createContent(body)

    if (entity && entity.id) {
      reply.header("Location", `/contents/${entity.id}`)
      reply.code(201).send(entity)
    } else {
      reply.code(422).send()
    }
  })
}
