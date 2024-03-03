import { ensureObjectId } from "~/helpers/objectid"
import type { FastifyInstance, RouteShorthandOptions } from "fastify"
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
      return reply.internalServerError()
    }

    const project = await instance.projects.create({
      name: request.body.name,
      active: true,
      domains: [] as DomainSettings[], // User can edit project settings later
      owner: ensureObjectId(token.userId),
    } as Project)

    if (project == null) {
      return reply.unprocessableEntity(
        "Project with the same name already exists for this user."
      )
    }

    await Promise.all([
      instance.users.setProjectOwner(
        token.userId.toString(),
        project.insertedId.toString()
      ),
      instance.permissions.setAdminUser(
        token.userId,
        project.insertedId,
        "grant"
      ),
    ])

    reply.code(201).send(project)
  })
}
