import fastifyPlugin from "fastify-plugin"
import { FastifyInstance } from "fastify"
import user from "./user"
import content from "./content"
import contentTypes from "./contentTypes"
import uploads from "./uploads"
import projects from "./projects"

async function cmsAPI(
  fastify: FastifyInstance,
  options: never,
  done: Function
) {
  fastify.register(user)
  fastify.register(content)
  fastify.register(contentTypes)
  fastify.register(uploads, { uploadDir: "uploads" })
  fastify.register(projects)

  done()
}

export default fastifyPlugin(cmsAPI)
