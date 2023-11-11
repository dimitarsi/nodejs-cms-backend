import { FastifyInstance } from "fastify"
import { CreateContentType } from "~/models/contentType"
import { schemaRef } from "~/schema/cms-api"

const createOptions = {
  schema: {
    body: schemaRef("contentTypeCreatePayload"),
  },
}

export default function createContentType(instance: FastifyInstance) {
  instance.post<{
    Body: CreateContentType
  }>("/content-types", createOptions, async (request, reply) => {
    const result = await instance.contentTypes.create(request.body)

    if (result.insertedId) {
      reply
        .code(201)
        .header("Localtion", `/content-types/${result.insertedId}`)
        .send({
          id: result.insertedId,
        })
    } else {
      reply.code(422).send({
        message: "Cannot create contentType",
      })
    }
  })
}
