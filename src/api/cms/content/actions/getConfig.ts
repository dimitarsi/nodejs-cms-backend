import { ContentRepo } from "@repo/content"
import contentTypesRepo from "@repo/contentTypes"
import { Controller } from "~/core/api/crud/actions/types"

export async function getConfig(this: Controller<ContentRepo>) {
  const { id, repo } = this

  const content = id ? await repo.getById(id) : null

  if (content == null || !content?.configId) {
    return null
  }

  const config = await contentTypesRepo.getById(content.configId)

  return config
}
