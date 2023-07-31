import contentTypes from '@repo/contentTypes'
import { compositeContentType, textContentType, freezeAllChildren } from '~/models/contentType'

export const seedComponents = async () => {

  const metaType =
    compositeContentType("Meta", true)
      .add(textContentType("SEO Title"))
      .add(textContentType("SEO Description"))
      .getType();
  
  await contentTypes.create(metaType)

  const metaTypeItem = await contentTypes.getById("meta")

  freezeAllChildren(metaTypeItem)

  await contentTypes.create(
    compositeContentType("Post Page", true)
      .add(
        compositeContentType("Content")
          .add(textContentType("Title"))
          .add(textContentType("Description"))
          .getType()
      )
      .add(metaTypeItem)
      .getType()
  )
}