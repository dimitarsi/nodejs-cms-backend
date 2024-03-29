import type { FastifyInstance, RouteShorthandOptions } from "fastify"
import { ensureObjectId } from "~/helpers/objectid"
import { schemaRef } from "~/schema/cmsAPISchema"

const getAllOptions: RouteShorthandOptions = {
  schema: {
    params: schemaRef("projectIdParamStrict"),
    querystring: schemaRef("filtersAndPageQuery"),
    // @ts-ignore
    tags: ["user"],
    description: "This is a description for the activate endpoint",
    response: {
      "200": {
        type: "object",
        properties: {
          items: { type: "array" },
          pagination: {
            type: "object",
            properties: {
              page: { type: "number" },
              perPage: { type: "number" },
              count: { type: "number" },
              totalPage: { type: "number" },
              nextPage: { type: "number" },
            },
          },
        },
      },
    },
  },
}

export default function getAll(instance: FastifyInstance) {
  instance.get<{
    Params: { projectId: string }
    Querystring: { page: number; perPage: number; folder?: string }
  }>("/:projectId/contents", getAllOptions, async (request, reply) => {
    const byProjectId = {
      projectId: ensureObjectId(request.params.projectId),
    }

    const filter = {
      ...(request.query.folder
        ? { folderLocation: `${decodeURIComponent(request.query.folder)}` }
        : {}),
      ...byProjectId,
    }

    const result = await instance.contents.searchAll(request.query.page, {
      perPage: request.query.perPage,
      filter,
    })

    if (!result) {
      return reply.notFound()
    }

    reply.code(200).send(result)
  })
}
