import type { FastifyInstance, RouteShorthandOptions } from "fastify"
import createUserCaseFrom from "~/services/users"
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
    const userCase = createUserCaseFrom(
      instance.users,
      instance.accessToken,
      instance.projects,
      instance.invitations,
      instance.permissions
    )

    instance.log.info({ token: accessTokenHeader })

    const projects = await userCase.getProjectsFromToken(accessTokenHeader)

    if (!projects.length) {
      reply.code(404).send({ message: "User is not assigned to any projects" })
      return
    }

    reply.send(projects)
  })
}
