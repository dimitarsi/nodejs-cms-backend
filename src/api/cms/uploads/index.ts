import { FastifyPluginCallback } from "fastify"
import fs from "node:fs"
import fsPromise from "fs/promises"
import path from "node:path"
import { MediaDocument } from "~/models/media"
import { v4 } from "uuid"
import auth from "@middleware/auth"

type PluginOptions = { uploadDir: string }

const filesPlugin: FastifyPluginCallback<PluginOptions> = async (
  instance,
  options,
  done
) => {
  const location = path.join(process.cwd(), options.uploadDir)

  instance.register(import("@fastify/multipart"))

  auth(instance, { isAdmin: true }, () => {})

  fsPromise
    .mkdir(location)
    .then(() => {
      console.log("[Server Boot] Create upload dir at", location)
    })
    .catch((_e) => {
      console.log(
        "[Server Boot] SKIP creating upload dir - already exists or no permissions",
        location
      )
    })

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
        path: `${options.uploadDir}${`${id}${parsed.ext}`}`,
        absolutePath: location,
      })

      const fsStream = fs.createWriteStream(location)
      const openPipe = new Promise((res, rej) => {
        fsStream.on("close", () => {
          res(true)
        })
        fsStream.on("error", (e) => {
          console.log(">> Stream Error", e)
          rej(e)
        })
      })

      f.file.pipe(fsStream)
      openPipes.push(openPipe)
    }

    console.log("..save many", bulkSave)

    try {
      await Promise.all([instance.media.insertMany(bulkSave), ...openPipes])
    } catch (e) {
      console.log(e)
      reply.code(500).send({
        error: "Error saving files",
        message: "Could not save all files",
      })
    }

    reply.send()
  })

  done()
}

export default filesPlugin
