import { ObjectId } from "mongodb"
import { ContentsRepo, ContentTypesRepo } from "~/repo"
import { generateFromConfig, validateContentWithConfig } from "./helpers"

export default function getContentCaseFrom(repo: {
  contents: ContentsRepo
  contentTypes: ContentTypesRepo
}) {
  return {
    async byId(
      idOrSlug: string,
      options: { validateData: boolean } = { validateData: true }
    ) {
      const entity = await repo.contents.getById(idOrSlug)

      // Nothing to validate, return the entity as is
      if (!options?.validateData) {
        return entity
      }

      // No config found!
      if (entity.configId === undefined) {
        return entity
      }

      const config = await repo.contentTypes.getById(entity.configId)

      // No config found!
      if (!config) {
        return entity
      }

      return validateContentWithConfig(entity, config)
    },
  }
}
