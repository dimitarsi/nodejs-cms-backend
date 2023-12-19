import { FastifyPluginCallback } from "fastify"
import fs from "node:fs"
import fsPromise from "fs/promises"
import path from "node:path"
import auth from "@middleware/auth"
import uploadAction, { type PluginOptions } from "./actions/upload"
import getAll from "./actions/getAll"
import deleteMedia from "./actions/delete"

const filesPlugin: FastifyPluginCallback<PluginOptions> = async (
  instance,
  options,
  done
) => {
  const location = path.join(process.cwd(), options.uploadDir)

  instance.register(import("@fastify/multipart"))

  auth(instance, { isAdmin: true })

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

  uploadAction(instance, options)
  getAll(instance)
  deleteMedia(instance)

  done()
}

export default filesPlugin
