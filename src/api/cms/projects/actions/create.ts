import type { FastifyInstance, RouteShorthandOptions } from "fastify"
import { Project } from "~/models/project"

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
  }>("/projects", createProjectOptions, (request, reply) => {
    instance.projects.create(request.body as Project)
  })
}
