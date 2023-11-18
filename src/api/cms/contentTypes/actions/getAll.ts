import { FastifyInstance } from "fastify"

export default function getAll(instance: FastifyInstance) {
  instance.get<{
    Querystring: { page: number; perPage: number }
  }>("/content-types", async (request, reply) => {
    const result = await instance.contentTypes.getAll(
      request.query.page,
      request.query.perPage
    )

    if (!result) {
      reply.code(404).send()
      return
    }

    reply.code(200).send(result)
  })
}
