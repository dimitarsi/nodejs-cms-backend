import fs from "fs"
import { type FastifyInstance, type FastifyPluginCallback } from "fastify"

// TODO: add support for cache and eTag?
const mediaPlugin: FastifyPluginCallback = (instance, _options, done) => {
  // instance.get<{
  //   Params: { id: string }
  // }>("/media/:id", async (req, reply) => {
  //   const { path, filetype } = await instance.media.getPath(req.params.id)

  //   if (!path || fs.existsSync(path) === false) {
  //     reply.status(404)
  //     reply.send({
  //       error: "Not found",
  //       message: "No such file in DB",
  //     })
  //     return
  //   }
  //   if (filetype) {
  //     reply.header("content-type", filetype)
  //   }

  //   const stream = fs.createReadStream(path)

  //   return reply.send(stream)
  // })

  done()
}

export default mediaPlugin
