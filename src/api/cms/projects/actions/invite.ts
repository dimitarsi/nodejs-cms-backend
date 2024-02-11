import type { FastifyInstance, RouteShorthandOptions } from "fastify"

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
    Params: { projectId: string }
    Body: { userEmail: string; projectId: string }
  }>("/projects/:projectId/invite", inviteOptions, async (request, reply) => {
    await instance.invitations.create({
      userEmail: request.body.userEmail,
      projectId: request.body.projectId,
    })

    reply.status(201).send({
      success: true,
    })
  })
}
