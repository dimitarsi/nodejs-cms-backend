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
    const usersCase = createUserCaseFrom(
      instance.users,
      instance.accessToken,
      instance.projects,
      instance.invitations,
      instance.permissions
    )

    const accessTokenHeader = request.headers["x-access-token"] as string

    await usersCase.acceptInvitation(
      accessTokenHeader,
      request.params.projectId,
      request.query.invitationToken
    )

    reply.status(200).send({
      success: true,
    })
  })
}
