import { FastifyPluginCallback } from "fastify"
import getAll from "./actions/getAll"
import getById from "./actions/getById"
import create from "./actions/create"
import updateContentType from "./actions/update"
import deleteContentType from "./actions/delete"
import auth from "@middleware/auth"

const contentTypes: FastifyPluginCallback = (instance, options, done) => {
  auth(instance, { isAdmin: true })

  getAll(instance)
  getById(instance)
  create(instance)
  updateContentType(instance)
  deleteContentType(instance)

  done()
}

export default contentTypes
