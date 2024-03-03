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
    const { usersService } = instance.services
    const accessTokenHeader = request.headers["x-access-token"] as string

    const projects = await usersService.getProjectsFromToken(accessTokenHeader)

    if (!projects.length) {
      return reply.notFound("User is not assigned to any projects")
    }

    reply.send(projects)
  })
}
