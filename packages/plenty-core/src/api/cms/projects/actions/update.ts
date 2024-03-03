import type { FastifyInstance, RouteShorthandOptions } from "fastify"
import type { Project } from "~/models/project"

const routeOptions: RouteShorthandOptions = {
  schema: {
    params: {
      type: "object",
      properties: {
        projectId: { type: "string" },
      },
      additionalProperties: false,
    },
    body: {
      type: "object",
      properties: {
        name: { type: "string" },
        domains: {
          type: "array",
          items: {
            type: "object",
            properties: {
              host: { type: "string" },
              defaultLocale: { type: "string" },
              supportedLanguages: { type: "array", items: { type: "string" } },
            },
          },
        },
      },
      required: [],
      additionalProperties: false,
    },
  },
}

export default function updateProject(instance: FastifyInstance) {
  instance.patch<{
    Params: { projectId: string }
    Body: Partial<Project>
  }>("/projects/:projectId", routeOptions, async (request, reply) => {
    const result = await instance.projects.update(
      request.params.projectId,
      request.body
    )

    if (result.acknowledged && result.modifiedCount > 0) {
      return reply.code(200).send({
        upsertedId: result.upsertedId,
      })
    }

    reply.code(422).send({ message: "Error updating project" })
  })
}
