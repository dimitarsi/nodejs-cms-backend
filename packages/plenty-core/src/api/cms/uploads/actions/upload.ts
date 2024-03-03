import fs from "fs"
import path from "path"
import { v4 } from "uuid"
import { MediaDocument } from "../../../../models/media"
import { type FastifyInstance } from "fastify"

export type PluginOptions = { uploadDir: string }

export default function uploadAction(
  instance: FastifyInstance,
  options: PluginOptions
) {
  instance.post("/attachments", async (req, reply) => {
    const files = await req.files()
    const openPipes = []
    const bulkSave: MediaDocument[] = []

    for await (const f of files) {
      const id = v4()
      const parsed = path.parse(f.filename)
      const location = path.join(
        process.cwd(),
        options.uploadDir,
        `${id}${parsed.ext}`
      )

      bulkSave.push({
        location: options.uploadDir,
        originalName: f.filename,
        mimetype: f.mimetype,
        ext: parsed.ext,
        fileId: id,
        path: `${options.uploadDir}/${`${id}${parsed.ext}`}`,
        absolutePath: location,
      })

      const fsStream = fs.createWriteStream(location)
      const openPipe = new Promise((res, rej) => {
        fsStream.on("close", () => {
          res(true)
        })
        fsStream.on("error", (e) => {
          rej(e)
        })
      })

      f.file.pipe(fsStream)
      openPipes.push(openPipe)
    }

    try {
      await Promise.all([instance.media.insertMany(bulkSave), ...openPipes])
    } catch (e) {
      reply.code(500).send({
        error: "Error saving files",
        message: "Could not save all files",
      })
    }

    reply.send()
  })
}
