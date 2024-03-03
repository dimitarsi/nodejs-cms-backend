import { FastifyInstance, RouteShorthandOptions } from "fastify"

const routeOptions: RouteShorthandOptions = {}

export default function getProjectUsers(instance: FastifyInstance) {
  instance.get<{
    Params: {
      projectId: string
    }
  }>("/projects/:projectId/users", routeOptions, async (_request, reply) => {
    reply.notImplemented()
  })
}
