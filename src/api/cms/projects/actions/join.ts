import type { FastifyInstance, RouteShorthandOptions } from "fastify"
import createUserCaseFrom from "~/cases/users"

const inviteOptions: RouteShorthandOptions = {
  schema: {
    params: {
      type: "object",
      properties: {
        privateInvitationToken: { type: "string" },
      },
    },
    body: {
      type: "object",
      properties: {},
    },
  },
}

export default function join(instance: FastifyInstance) {
  instance.post<{
    Params: { privateInvitationToken: string }
    Body: {}
  }>(
    "/project/:privateInvitationToken/invite",
    inviteOptions,
    async (request, reply) => {
      const usersCase = createUserCaseFrom(
        instance.users,
        instance.accessToken,
        instance.projects,
        instance.invitations
      )

      const accessTokenHeader = request.headers["x-access-token"] as string

      await usersCase.acceptInvitation(
        accessTokenHeader,
        request.params.privateInvitationToken
      )

      reply.status(201).send({
        success: true,
      })
    }
  )
}
