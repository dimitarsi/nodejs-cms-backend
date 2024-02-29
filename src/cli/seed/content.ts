import contentTypesRepo from "~/repo/contentTypes"
import { type Db, type ObjectId } from "mongodb"
import contentRepo from "~/repo/contents"
import slugify from "~/helpers/slugify"
import createContentService from "~/services/content"
import { ensureObjectId } from "~/helpers/objectid"

export const createContent =
  (db: Db) =>
  async (
    projectId: ObjectId | string,
    configId: ObjectId | string | undefined,
    name?: string,
    data: any = null
  ) => {
    if (!configId || !name) {
      return
    }

    const contents = contentRepo(db)
    const contentTypes = contentTypesRepo(db)
    const usersService = createContentService({ contents, contentTypes })

    return await usersService.createContent(
      {
        name: name,
        slug: slugify(name),
        configId: configId,
        folderLocation: "/",
        isFolder: false,
        folderTarget: "/",
        children: [],
        data,
        projectId: ensureObjectId(projectId),
      },
      ensureObjectId(projectId)
    )
  }
