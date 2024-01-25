import { type FastifyInstance } from "fastify"
import util from "util"

// const options = {
//   request: {
//     query: schemaRef("pageQuery"),
//   },
// }

export default function getAll(instance: FastifyInstance) {
  instance.get<{
    Querystring: { page: string; perPage: number }
  }>("/api/media", async (req, reply) => {
    const page = Math.max(1, parseFloat(req.query.page || "1"))

    const res = await instance.media.getAll(page)

    if (!res) {
      reply.code(404).send()
      return
    }

    reply.code(200).send(res)
  })
}
