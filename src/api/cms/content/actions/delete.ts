import { FastifyInstance } from "fastify"
import { schemaRef } from "~/schema/cmsAPISchema"

const deleteOpts = {
  schema: {
    params: schemaRef("idOrSlugAndProjectIdParamStrict"),
  },
}

export default function deleteUser(instance: FastifyInstance) {
  instance.delete<{ Params: { idOrSlug: string | number; projectId: string } }>(
    "/:projectId/contents/:idOrSlug",
    deleteOpts,
    async (req, reply) => {
      await instance.contents.deleteById(req.params.idOrSlug)

      reply.code(200)
    }
  )
}
