import type { FastifyInstance, RouteShorthandOptions } from "fastify"
import { schemaRef } from "~/schema/cms-api"

const getAllOptions: RouteShorthandOptions = {
  schema: {
    querystring: schemaRef("filtersAndPageQuery"),
    // @ts-ignore
    tags: ["user"],
    description: "This is a description for the activate endpoint",
    // response: {
    //   "200": {
    //     type: "object",
    //     properties: {
    //       items: { type: "array" },
    //       pagination: {
    //         type: "object",
    //         properties: {
    //           page: { type: "number" },
    //           perPage: { type: "number" },
    //           count: { type: "number" },
    //           totalPage: { type: "number" },
    //           nextPage: { type: "number" },
    //         },
    //       },
    //     },
    //   },
    // },
  },
}

export default function getAll(instance: FastifyInstance) {
  instance.get<{
    Querystring: { page: number; perPage: number; folder?: string }
  }>("/contents", getAllOptions, async (request, reply) => {
    const filter = {
      ...(request.query.folder
        ? { folderLocation: `${decodeURIComponent(request.query.folder)}` }
        : {}),
    }

    const result = await instance.contents.searchAll(request.query.page, {
      perPage: request.query.perPage,
      filter,
    })

    if (!result) {
      reply.code(404).send()
      return
    }

    reply.code(200).send(result)
  })
}
