import { ObjectId } from "mongodb"
import type { ContentTypesRepo, ContentsRepo } from "~/repo"
import {
  emptyDataOrNull,
  generateFromConfig,
  validateContentWithConfig,
} from "./helpers"
import util from "util"
import type { CreateContentPayload } from "~/models/content"

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

      console.log(
        ">>> entity",
        util.inspect(
          {
            entity,
            config,
          },
          { depth: 10 }
        )
      )

      // return entity

      return validateContentWithConfig(entity, config)
    },
    async createContent(payload: CreateContentPayload) {
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
          new ObjectId(payload.configId)
        )

        data = config ? generateFromConfig(config) : null
      } else {
        data = payload
      }

      const result = await repo.contents.create({
        ...payload,
        children: data?.children,
        data: data?.data,
        folderDepth: parts.length,
      })

      return await repo.contents.getById(result.insertedId.toString())
    },
    async updateContent(
      idOrSlug: string,
      payload: Partial<CreateContentPayload>
    ) {
      let data = null

      if (
        !payload.isFolder &&
        payload.configId &&
        emptyDataOrNull(payload.data)
      ) {
        const config = await repo.contentTypes.getById(
          new ObjectId(payload.configId)
        )

        data = config ? generateFromConfig(config) : null
      } else {
        data = payload
      }

      if (typeof payload.folderLocation !== "undefined") {
        const path = payload.folderLocation.replace(/^\//, "")
        // get non null parts
        const parts = path.split("/").filter((part: string) => part)

        await repo.contents.update(idOrSlug, {
          ...payload,
          children: data?.children,
          data: data?.data,
          folderDepth: parts.length,
        })
      } else {
        await repo.contents.update(idOrSlug, payload)
      }

      return await repo.contents.getById(idOrSlug)
    },
  }
}
