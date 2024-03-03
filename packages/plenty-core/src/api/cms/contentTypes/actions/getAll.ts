import { FastifyInstance } from "fastify"
import { ensureObjectId } from "~/helpers/objectid"

export default function getAll(instance: FastifyInstance) {
  instance.get<{
    Querystring: { page: number; perPage: number; search: string }
    Params: { projectId: string }
  }>("/:projectId/content-types", async (request, reply) => {
    const byProjectId = { projectId: ensureObjectId(request.params.projectId) }
    const filter = {
      ...(request.query.search
        ? { $text: { $search: `${decodeURIComponent(request.query.search)}` } }
        : {}),
      ...byProjectId,
    }

    const result = await instance.contentTypes.searchAll(request.query.page, {
      perPage: request.query.perPage,
      filter,
    })

    if (!result) {
      return reply.notFound()
    }

    reply.code(200).send(result)
  })
}
