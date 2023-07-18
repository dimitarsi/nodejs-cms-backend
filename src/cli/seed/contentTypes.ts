import contentTypes from '@repo/contentTypes'
import { compositeContentType, textContentType } from '~/models/contentType'

export const seedComponents = async () => {

  await contentTypes.create(
    compositeContentType("Post Page")
      .add(
        compositeContentType("Content")
          .add(textContentType("Title"))
          .add(textContentType("Description"))
          .getType()
      )
      .add(
        compositeContentType("Meta")
          .add(textContentType("SEO Title"))
          .add(textContentType("SEO Description"))
          .getType()
      )
      .getType()
  )
}