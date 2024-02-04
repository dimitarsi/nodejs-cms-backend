import { FastifyInstance, RouteShorthandOptions } from "fastify"
import { schemaRef } from "~/schema/cmsAPISchema"

export default function activateUser(instance: FastifyInstance) {
  instance.get<{
    Params: { id: string }
    Querystring: { hash: string }
  }>("/users/:id/activate", activateOptions, async (req, reply) => {
    const id = req.params.id

    const result = await instance.users.selfActivate(id, req.query.hash)

    if (!result) {
      reply.code(404)
    }

    reply.send()
  })
}

const activateOptions: RouteShorthandOptions = {
  schema: {
    params: schemaRef("idParamStrict"),
    querystring: schemaRef("hashQueryStrict"),
    // @ts-ignore
    tags: ["user"],
    description: "This is a description for the activate endpoint",
  },
}
