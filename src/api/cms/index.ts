import fastifyPlugin from "fastify-plugin"
import { FastifyInstance } from "fastify"
import user from "./user"
import content from "./content"
import contentTypes from "./contentTypes"

async function cmsAPI(
  fastify: FastifyInstance,
  options: never,
  done: Function
) {
  fastify.register(user)
  fastify.register(content)
  fastify.register(contentTypes)

  done()
}

export default fastifyPlugin(cmsAPI)
