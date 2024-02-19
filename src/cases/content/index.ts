import { ObjectId } from "mongodb"
import type { ContentTypesRepo, ContentsRepo } from "~/repo"
import {
  emptyDataOrNull,
  generateFromConfig,
  validateContentWithConfig,
} from "./helpers"
import type { CreateContentPayload } from "~/models/content"
import { ensureObjectId } from "~/helpers/objectid"

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
      projectId: ObjectId | string,
      options: { validateData: boolean } = { validateData: true }
    ) {
      const entity = await repo.contents.getById(idOrSlug, projectId)

      // Nothing to validate, return the entity as is
      if (!options?.validateData) {
        return entity
      }

      // No config found!
      if (entity.configId === undefined) {
        return entity
      }

      const config = await repo.contentTypes.getById(entity.configId, projectId)

      // No config found!
      if (!config) {
        return entity
      }

      return validateContentWithConfig(entity, config)
    },
    async createContent(
      payload: CreateContentPayload,
      projectId: ObjectId | string
    ) {
      const path = payload.folderLocation.replace(/^\//, "")
      // get non null parts
      const parts = path.split("/").filter((part: string) => part)
      let data = null

      if (payload.isFolder) {
        payload = {
          ...getDefaultPayload(payload.slug),
          ...payload,
        }
      } else if (emptyDataOrNull(payload.data) && payload.configId) {
        const config = await repo.contentTypes.getById(
          new ObjectId(payload.configId),
          projectId
        )

        data = config ? generateFromConfig(config) : null
      } else {
        data = payload
      }

      const result = await repo.contents.create(
        {
          ...payload,
          children: data?.children || [],
          data: data?.data,
          folderDepth: parts.length,
        },
        projectId
      )

      return await repo.contents.getById(
        result.insertedId.toString(),
        projectId
      )
    },
    async updateContent(
      idOrSlug: string,
      payload: Partial<CreateContentPayload>,
      projectId: string
    ) {
      if (typeof payload.folderLocation !== "undefined") {
        const path = payload.folderLocation.replace(/^\//, "")
        // get non null parts
        const parts = path.split("/").filter((part: string) => part)

        await repo.contents.updateForProject(
          idOrSlug,
          ensureObjectId(projectId),
          {
            ...payload,
            folderDepth: parts.length,
          }
        )
      } else {
        await repo.contents.updateForProject(
          idOrSlug,
          ensureObjectId(projectId),
          payload
        )
      }

      return await repo.contents.getById(idOrSlug, projectId)
    },
  }
}
