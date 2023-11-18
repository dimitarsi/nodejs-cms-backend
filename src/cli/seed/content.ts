import { type Db, type ObjectId } from "mongodb"
import contentRepo from "~/repo/contents"
import slugify from "~/helpers/slugify"

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

    const repo = contentRepo(db)

    return await repo.create({
      name: name,
      slug: slugify(name),
      configId: configId,
      folderLocation: "/",
      data,
    })
  }
