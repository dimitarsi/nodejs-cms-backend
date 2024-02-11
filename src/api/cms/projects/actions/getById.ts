import type { FastifyInstance } from "fastify"

export function getProjectById(instance: FastifyInstance) {
  instance.get<{
    Params: { projectId: string }
  }>("/projects/:projectId", async (request, reply) => {
    const project = await instance.projects.getById(request.params.projectId)

    reply.code(200).send(project)
  })
}
