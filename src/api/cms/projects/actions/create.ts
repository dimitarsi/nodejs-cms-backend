import { ensureObjectId } from "~/helpers/objectid"
import type { FastifyInstance, RouteShorthandOptions } from "fastify"
import createUserCaseFrom from "~/cases/users"
import { DomainSettings, Project } from "~/models/project"

const createProjectOptions: RouteShorthandOptions = {
  schema: {
    body: {
      type: "object",
      properties: {},
    },
  },
}

export default function createProject(instance: FastifyInstance) {
  instance.post<{
    Body: Omit<Project, "_id">
  }>("/projects", createProjectOptions, async (request, reply) => {
    const tokenHeader = request.headers["x-access-token"] as string
    const token = await instance.accessToken.findToken(tokenHeader)

    if (!token?.userId) {
      reply.status(500).send({ message: "Something went wrong" })
      return
    }

    const project = await instance.projects.create({
      name: request.body.name,
      active: true,
      domains: [] as DomainSettings[], // edit project settings later
      owner: ensureObjectId(token.userId),
    } as Project)

    reply.status(201).send(project)
  })
}
