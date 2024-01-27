import type { FastifyInstance, RouteShorthandOptions } from "fastify"
import createUserCaseFrom from "~/cases/users"

const inviteOptions: RouteShorthandOptions = {
  schema: {
    params: {
      type: "object",
      properties: {
        id: { type: "string" },
      },
    },
    body: {
      type: "object",
      properties: {
        userEmail: {
          type: "string",
        },
        projectId: {
          type: "string",
        },
      },
    },
  },
}

export default function inviteUser(instance: FastifyInstance) {
  instance.post<{
    Params: { id: string }
    Body: { userEmail: string; projectId: string }
  }>("/project/:id/invite", inviteOptions, async (request, reply) => {
    // Verify Admin owns the project
    // Create an invite - save invite token and expiration date
    // User may or may not have a registered account!
    // Sent Email?

    const usersCase = createUserCaseFrom(
      instance.users,
      instance.accessToken,
      instance.projects
    )

    await usersCase.inviteUserToProject(
      request.body.userEmail,
      request.body.projectId
    )

    reply.status(201).send({
      success: true,
    })
  })
}
