import { FastifyInstance } from "fastify"
import { schemaRef } from "~/schema/cms-api"

const createContentPayload = {
  schema: {
    body: schemaRef("contentCreatePayload"),
  },
}

export default function createContents(instance: FastifyInstance) {
  instance.post<{
    Body: Record<string, any>
  }>("/contents", createContentPayload, async (request, reply) => {
    const result = await instance.contents.create(request.body)

    reply.code(201).send({
      id: result.insertedId.toString(),
    })
  })
}
