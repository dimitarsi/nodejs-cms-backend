import { FastifyInstance, FastifyPluginCallback } from "fastify"

export default function deleteProject(instance: FastifyInstance) {
  instance.delete<{
    Params: { projectId: string }
  }>("/projects/:projectId", async (request, reply) => {
    await Promise.all([
      instance.projects.deleteById(request.params.projectId),
      instance.permissions.deleteAll(request.params.projectId),
    ])

    reply.code(204).send()
  })
}
