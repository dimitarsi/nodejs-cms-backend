import { FastifyPluginCallback } from "fastify"
import getAll from "./actions/getAll"
import getById from "./actions/getById"
import create from "./actions/create"
import updateContentType from "./actions/update"
import deleteContentType from "./actions/delete"
import auth from "@middleware/auth"
import projectAccess from "@middleware/projectAccess"

const contentTypes: FastifyPluginCallback = (instance, options, done) => {
  instance.register((instance, _options, done) => {
    projectAccess(instance, { accessLevel: "readOrUp" })

    getAll(instance)
    getById(instance)

    done()
  })

  instance.register((instance, _options, done) => {
    projectAccess(instance, { accessLevel: "writeOrUp" })

    create(instance)
    updateContentType(instance)
    deleteContentType(instance)

    done()
  })

  done()
}

export default contentTypes
