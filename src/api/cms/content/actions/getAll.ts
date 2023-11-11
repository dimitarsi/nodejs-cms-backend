import { FastifyInstance, RouteShorthandOptions } from "fastify"
import { schemaRef } from "~/schema/cms-api"

const getAllOptions: RouteShorthandOptions = {
  schema: {
    querystring: schemaRef("pageQuery"),
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
    Querystring: { page: number; perPage: number }
  }>("/contents", getAllOptions, async (request, reply) => {
    const result = await instance.contents.getAll(request.query.page, {
      perPage: request.query.perPage,
    })

    if (!result) {
      reply.code(404).send()
      return
    }

    reply.code(200).send(result)
  })
}
