import { ObjectId } from "mongodb"
import type { ContentTypesRepo, ContentsRepo } from "~/repo"
import {
  emptyDataOrNull,
  generateFromConfig,
  validateContentWithConfig,
} from "./helpers"

const getDefaultPayload = (slug: string) => ({
  folderLocation: "/",
  folderTarget: slug,
})

export default function createContentCaseFrom(repo: {
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
    async createContent(payload: Record<string, any>) {
      if (payload.isFolder) {
        const depth = Math.min(
          1,
          (payload.folderLocation || "/").split("/").length - 1
        )

        payload = {
          depth,
          ...getDefaultPayload(payload.slug),
          ...payload,
        }
      } else if (emptyDataOrNull(payload.data) && payload.configId) {
        const config = await repo.contentTypes.getById(
          new ObjectId(payload.configId)
        )

        payload.data = config ? generateFromConfig(config) : null
      }

      const result = await repo.contents.create(payload)
      return await repo.contents.getById(result.insertedId.toString())
    },
    async updateContent(idOrSlug: string, payload: Record<string, any>) {
      if (
        !payload.isFolder &&
        payload.configId &&
        emptyDataOrNull(payload.data)
      ) {
        const config = await repo.contentTypes.getById(
          new ObjectId(payload.configId)
        )

        payload.data = config ? generateFromConfig(config) : null
      }

      await repo.contents.update(idOrSlug, payload)

      return await repo.contents.getById(idOrSlug)
    },
  }
}
