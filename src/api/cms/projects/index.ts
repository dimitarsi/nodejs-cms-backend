import auth from "@middleware/auth"
import type { FastifyInstance } from "fastify"
import getAll from "./actions/getAll"
import createProject from "./actions/create"
import invite from "./actions/invite"

export default function projects(
  instance: FastifyInstance,
  options: never,
  done: Function
) {
  instance.register(() => {
    auth(instance, { isAdmin: false })
    getAll(instance)
  })

  instance.register(() => {
    auth(instance, { isAdmin: true })
    createProject(instance)
    invite(instance)
  })

  done()
}
