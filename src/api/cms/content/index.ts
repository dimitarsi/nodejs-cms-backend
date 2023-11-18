import { FastifyPluginCallback } from "fastify"
import getAll from "./actions/getAll"
import getById from "./actions/getById"
import createContents from "./actions/create"
import updateContent from "./actions/update"
import deleteContent from "./actions/delete"
import auth from "@middleware/auth"

const contentController: FastifyPluginCallback = (instance, options, done) => {
  auth(instance, { isAdmin: true })

  getAll(instance)
  getById(instance)
  createContents(instance)
  updateContent(instance)
  deleteContent(instance)

  done()
}

export default contentController
