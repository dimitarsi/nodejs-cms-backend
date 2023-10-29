// import multer from "multer"
// import { insertMany, updateMedia } from "@repo/media"
import fileType from "~/helpers/fileType"
import Router from "~/core/api/router"
import { FastifyPluginCallback } from "fastify"
import fs from "node:fs"
import path from "node:path"
import { MediaDocument } from "~/models/media"
import { v4 } from "uuid"
// import nanoid from "nanoid"

// const app = Router("/attachments")

// const oldControlelr = (
//   router: ReturnType<typeof Router>,
//   prefix: `/${string}/` | "/" = "/"
// ) => {
//   const upload = multer({ dest: "uploads" })
//   router.post(
//     prefix,
//     upload.array("attachments"),
//     async function upload(req, res) {
//       const entries: any[] = []

//       for (const f of req.files as any[]) {
//         entries.push({
//           path: f.path,
//           mimetype: f.mimetype,
//           filetype: await fileType(f.path),
//           originalName: f.originalname,
//           size: f.size,
//         })
//       }
//       try {
//         const resp = await insertMany(entries)
//         res.status(200).json(
//           entries.map((entry, idx) => ({
//             id: resp.insertedIds[idx],
//             name: entry.originalName,
//             type: entry.filetype,
//           }))
//         )
//       } catch (e) {
//         res.status(400).json({ ok: false })
//       }
//     }
//   )

//   router.put(
//     `${prefix}:hash`,
//     upload.array("attachment"),
//     async function updateUpload(req, res) {
//       // const entries: any[] = []

//       if (!req.params.hash) {
//         res.status(404)
//         res.send()
//         return
//       }

//       let mediaData = req.body

//       if (req.file) {
//         mediaData = {
//           ...mediaData,
//           path: req.file.path,
//           mimetype: req.file.mimetype,
//           filetype: await fileType(req.file.path),
//           originalName: req.file.originalname,
//           size: req.file.size,
//         }
//       }

//       await updateMedia(req.params.hash, mediaData)

//       res.status(200)
//       res.send()
//     }
//   )
// }

type PluginOptions = { uploadDir: string }

const filesPlugin: FastifyPluginCallback<PluginOptions> = (
  instance,
  options,
  done
) => {
  instance.register(import("@fastify/multipart"))

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
        fsStream.on("error", () => rej())
      })

      f.file.pipe(fsStream)
      openPipes.push(openPipe)
    }

    console.log("..save many", bulkSave)

    await Promise.all([instance.media.insertMany(bulkSave), ...openPipes])

    reply.send()
  })

  done()
}

export default filesPlugin
