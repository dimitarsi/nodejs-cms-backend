import contentTypes from "~/repo/contentTypes"
import { type Db } from "mongodb"
import {
  CT_TYPES,
  compositeContentType,
  createContentType,
  freezeAllChildren,
} from "~/models/contentType"

export const seedContentTypes = async (db: Db) => {
  const repo = contentTypes(db)

  const metaType = compositeContentType("Meta", true)
    .add(createContentType("SEO Title"))
    .add(createContentType("SEO Description"))
    .getType()

  await repo.create(metaType)

  const metaTypeItem = await repo.getById("meta")

  if (metaTypeItem) {
    freezeAllChildren(metaTypeItem)
    const postType = compositeContentType("Post Page", true)
      .add(
        compositeContentType("Content")
          .add(createContentType("Title"))
          .add(createContentType("Description"))
          .getType()
      )
      .add(metaTypeItem)

    CT_TYPES.forEach((t) => {
      postType.add(createContentType(`Post ${t.toUpperCase()}`, t))
    })

    return await repo.create(postType.getType())
  }
}
