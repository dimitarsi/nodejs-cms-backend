import { FastifyInstance } from "fastify"
import { schemaRef } from "~/schema/cmsAPISchema"

const deleteOpts = {
  schema: {
    params: schemaRef("idOrSlugParamStrict"),
  },
}

export default function deleteUser(instance: FastifyInstance) {
  instance.delete<{ Params: { idOrSlug: string | number } }>(
    "/contents/:idOrSlug",
    deleteOpts,
    async (req, reply) => {
      await instance.contents.deleteById(req.params.idOrSlug)

      reply.code(200)
    }
  )
}
