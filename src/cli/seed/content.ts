import contentTypesRepo from "~/repo/contentTypes"
import { type Db, type ObjectId } from "mongodb"
import contentRepo from "~/repo/contents"
import slugify from "~/helpers/slugify"
import createContentCaseFrom from "~/cases/content"

export const createContent =
  (db: Db) =>
  async (
    configId: ObjectId | string | undefined,
    name?: string,
    data: any = null
  ) => {
    if (!configId || !name) {
      return
    }

    const contents = contentRepo(db)
    const contentTypes = contentTypesRepo(db)
    const usecase = createContentCaseFrom({ contents, contentTypes })

    return await usecase.createContent({
      name: name,
      slug: slugify(name),
      configId: configId,
      folderLocation: "/",
      isFolder: false,
      folderTarget: "/",
      children: [],
      data,
    })
  }
