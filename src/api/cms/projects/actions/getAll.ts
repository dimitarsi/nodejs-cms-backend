import type { FastifyInstance, RouteShorthandOptions } from "fastify"
import { schemaRef } from "~/schema/cmsAPISchema"

const getAllOptions: RouteShorthandOptions = {
  schema: {
    querystring: schemaRef("filtersAndPageQuery"),
  },
}

export default function createProject(instance: FastifyInstance) {
  instance.get<{
    Querystring: { page: number; perPage: number }
  }>("/projects", getAllOptions, async (request, reply) => {
    const accessTokenHeader = request.headers["x-access-token"] as string
    const { usersService } = instance.services

    instance.log.info({ token: accessTokenHeader })

    const projects = await usersService.getProjectsFromToken(accessTokenHeader)

    if (!projects.length) {
      reply.code(404).send({ message: "User is not assigned to any projects" })
      return
    }

    reply.send(projects)
  })
}
