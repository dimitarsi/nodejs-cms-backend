import type { FastifyInstance, RouteShorthandOptions } from "fastify"
import createUserCaseFrom from "~/cases/users"
import { schemaRef } from "~/schema/cms-api"

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
      instance.projects
    )

    const projects = await userCase.getProjectsFromToken(accessTokenHeader)

    // const projects = await instance.projects.getAll(
    //   request.query.page,
    //   request.query.perPage
    // )
    // const token = await instance.accessToken.findToken(accessTokenHeader)

    // if (!token || !token.userId) {
    //   reply.code(404).send({ message: "Not Found or token has expired" })
    //   return
    // }

    // const user = await instance.users.getById(token.userId)

    if (!projects.length) {
      reply
        .code(404)
        .send({ message: "Not Found or User is not assigned to any projects" })
      return
    }

    // const projects = await instance.projects.getAllByIds(user.projects)
  })
}
