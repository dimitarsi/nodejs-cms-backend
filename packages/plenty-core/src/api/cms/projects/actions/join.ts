import type { FastifyInstance, RouteShorthandOptions } from "fastify"

const inviteOptions: RouteShorthandOptions = {
  schema: {
    params: {
      type: "object",
      properties: {
        privateInvitationToken: { type: "string" },
      },
    },
    // body: {
    //   type: "object",
    //   properties: {},
    // },
  },
}

export default function join(instance: FastifyInstance) {
  instance.post<{
    Querystring: { invitationToken: string }
    Params: { projectId: string }
    // Body: {}
  }>("/projects/:projectId/join", inviteOptions, async (request, reply) => {
    const { usersService } = instance.services

    const accessTokenHeader = request.headers["x-access-token"] as string

    const accepted = await usersService.acceptInvitation(
      accessTokenHeader,
      request.params.projectId,
      request.query.invitationToken
    )

    if (!accepted) {
      return reply.status(404).send({ message: "No invitation" })
    }

    reply.status(200).send({
      success: true,
    })
  })
}
