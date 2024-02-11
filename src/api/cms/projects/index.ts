import auth from "@middleware/auth"
import type { FastifyInstance } from "fastify"
import getAll from "./actions/getAll"
import createProject from "./actions/create"
import invite from "./actions/invite"
import projectAccess from "@middleware/projectAccess"
import deleteProject from "./actions/delete"

export default function projects(
  instance: FastifyInstance,
  options: never,
  done: Function
) {
  instance.register((instance, _options, done) => {
    projectAccess(instance, { accessLevel: "readOrUp" })

    getAll(instance)
    createProject(instance)

    done()
  })

  instance.register((instance, _options, done) => {
    projectAccess(instance, { accessLevel: "writeOrUp" })

    invite(instance)

    deleteProject(instance)

    done()
  })

  done()
}
