import type { FastifyInstance } from "fastify"
import getAll from "./actions/getAll"
import createProject from "./actions/create"
import invite from "./actions/invite"
import deleteProject from "./actions/delete"
import updateProject from "./actions/update"
import joinProject from "./actions/join"
import auth from "@middleware/auth"
import projectAccess from "@middleware/projectAccess"
import getById from "./actions/getById"
import getProjectUsers from "./actions/users"
import updatePermissions from "./actions/permissions"

export default function projects(
  instance: FastifyInstance,
  _options: never,
  done: Function
) {
  instance.register((instance, _options, done) => {
    auth(instance)

    joinProject(instance)
    createProject(instance)
    getAll(instance)

    done()
  })

  instance.register((instance, _options, done) => {
    projectAccess(instance, { accessLevel: "readOrUp" })

    getById(instance)

    done()
  })

  instance.register((instance, _options, done) => {
    projectAccess(instance, { accessLevel: "writeOrUp" })

    updateProject(instance)

    done()
  })

  instance.register((instance, _options, done) => {
    projectAccess(instance, { accessLevel: "manage" })

    invite(instance)
    deleteProject(instance)
    getProjectUsers(instance)
    updatePermissions(instance)

    done()
  })

  done()
}
