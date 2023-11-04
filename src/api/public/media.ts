import fs from "fs"
import { FastifyInstance } from "fastify"

// TODO: add support for cache and eTag?
export default function media(
  instance: FastifyInstance,
  options: never,
  done: Function
) {
  instance.get<{
    Params: { id: string }
  }>("/media/:id", async (req, reply) => {
    const { path, filetype } = await instance.media.getPath(req.params.id)

    if (!path || fs.existsSync(path) === false) {
      reply.status(404)
      reply.send({
        error: "Not found",
        message: "No such file in DB",
      })
      return
    }
    if (filetype) {
      reply.header("content-type", filetype)
    }

    const stream = fs.createReadStream(path)

    return reply.send(stream)
  })

  done()
}
