import { FastifyInstance, RouteShorthandOptions } from "fastify"

const routeOptions: RouteShorthandOptions = {}

export default function updatePermissions(instance: FastifyInstance) {
  instance.post<{
    Params: {
      projectId: string
      userId: string
    }
  }>(
    "/projects/:projectId/permissions/:userId",
    routeOptions,
    async (request, reply) => {}
  )
}
