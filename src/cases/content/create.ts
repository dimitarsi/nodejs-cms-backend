import { ObjectId } from "mongodb"
import type { ContentTypesRepo, ContentsRepo } from "~/repo"
import { generateFromConfig } from "./helpers"

export default function createContentCaseFrom(repo: {
  contents: ContentsRepo
  contentTypes: ContentTypesRepo
}) {
  return {
    async createContent(payload: Record<string, any>) {
      if (payload.data === null && payload.configId) {
        const config = await repo.contentTypes.getById(
          new ObjectId(payload.configId)
        )

        payload.data = config ? generateFromConfig(config) : null
      }

      const result = await repo.contents.create(payload)
      return await repo.contents.getById(result.insertedId.toString())
    },
  }
}
