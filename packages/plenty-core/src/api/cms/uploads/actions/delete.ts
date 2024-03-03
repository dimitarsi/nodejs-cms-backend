import { type FastifyInstance } from "fastify"
import util from "util"

// const options = {
//   request: {
//     query: schemaRef("pageQuery"),
//   },
// }

export default function deleteMedia(instance: FastifyInstance) {
  instance.delete<{
    Params: { idOrSlug: string }
  }>("/api/media/:idOrSlug", async (req, reply) => {
    const res = await instance.media.deleteById(req.params.idOrSlug)

    if (!res) {
      reply.code(404).send()
      return
    }

    reply.code(200).send(res)
  })
}
