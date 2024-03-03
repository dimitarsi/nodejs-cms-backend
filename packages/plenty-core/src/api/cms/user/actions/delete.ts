import { FastifyInstance, RouteShorthandOptions } from "fastify"
import { schemaRef } from "~/schema/cmsAPISchema"

const getByIdOptions: RouteShorthandOptions = {
  schema: {
    params: schemaRef("idParamStrict"),
  },
}

export default function deleteUser(instance: FastifyInstance) {
  instance.delete<{
    Params: { id: string }
  }>("/users/:id", getByIdOptions, async (req, reply) => {
    const id = req.params.id
    const result = await instance.users.deleteById(id)

    if (!result?.result.acknowledged) {
      return reply.notFound()
    }

    reply.send()
  })
}
