import { FastifyInstance } from "fastify"
import { schemaRef } from "~/schema/cmsAPISchema"

const idOrSlugOptions = {
  schema: {
    params: schemaRef("idOrSlugParamStrict"),
  },
}

export default function deleteContentType(instance: FastifyInstance) {
  instance.delete<{
    Params: { idOrSlug: string }
  }>("/content-types/:idOrSlug", idOrSlugOptions, async (request, replay) => {
    await instance.contentTypes.deleteById(request.params.idOrSlug)

    replay.code(200).send()
  })
}
