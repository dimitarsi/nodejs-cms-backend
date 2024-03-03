import { FastifyPluginCallback } from "fastify"
import getAll from "./actions/getAll"
import getById from "./actions/getById"
import createContents from "./actions/create"
import updateContent from "./actions/update"
import deleteContent from "./actions/delete"
import projectAccess from "@middleware/projectAccess"

const contentController: FastifyPluginCallback = (instance, options, done) => {
  instance.register((instance, _, done) => {
    projectAccess(instance, { accessLevel: "readOrUp" })

    getAll(instance)
    getById(instance)

    done()
  })

  instance.register((instance, _, done) => {
    projectAccess(instance, { accessLevel: "writeOrUp" })

    createContents(instance)
    updateContent(instance)
    deleteContent(instance)

    done()
  })

  done()
}

export default contentController
