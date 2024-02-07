import { FastifyInstance } from "fastify"

export default function getAll(instance: FastifyInstance) {
  instance.get<{
    Querystring: { page: number; perPage: number; search: string }
    Params: { projectId: string }
  }>("/:projectId/content-types", async (request, reply) => {
    const filter = {
      ...(request.query.search
        ? { $text: { $search: `${decodeURIComponent(request.query.search)}` } }
        : {}),
    }

    const result = await instance.contentTypes.searchAll(request.query.page, {
      perPage: request.query.perPage,
      filter,
    })

    if (!result) {
      reply.code(404).send()
      return
    }

    reply.code(200).send(result)
  })
}
