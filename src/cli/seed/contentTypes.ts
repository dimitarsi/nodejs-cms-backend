import contentTypes from '@repo/contentTypes'
import { CT_TYPES, compositeContentType, createContentType, freezeAllChildren } from '~/models/contentType'

export const seedComponents = async () => {

  const metaType =
    compositeContentType("Meta", true)
      .add(createContentType("SEO Title"))
      .add(createContentType("SEO Description"))
      .getType();
  
  await contentTypes.create(metaType)

  const metaTypeItem = await contentTypes.getById("meta")

  if (metaTypeItem) {
    freezeAllChildren(metaTypeItem);
    const postType = compositeContentType("Post Page", true)
      .add(
        compositeContentType("Content")
          .add(createContentType("Title"))
          .add(createContentType("Description"))
          .getType()
      )
      .add(metaTypeItem);
    
    CT_TYPES.forEach((t) => {
      postType.add(createContentType(`Post ${t.toUpperCase()}`, t))
    })

    await contentTypes.create(
      postType.getType()
    )
  }
}