import fastifyPlugin from "fastify-plugin"
import { FastifyInstance, RouteShorthandOptions } from "fastify"
import user from "./user"

async function cmsAPI(
  fastify: FastifyInstance,
  options: never,
  done: Function
) {
  fastify.register(user)

  done()
}

export default fastifyPlugin(cmsAPI)
