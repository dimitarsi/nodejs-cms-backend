import components from '@repo/components'
import contentTypes from '@repo/contentTypes'

export const seedComponents = async () => {
  const result = await components.create({
    groupName: "Seo Metadata",
    rows: [
      {
        displayName: "Title",
        slug: "title",
        type: "text",
        data: null,
      },
      {
        displayName: "Description",
        slug: "description",
        type: "text",
        data: null,
      },
      {
        displayName: "Image",
        slug: "image",
        type: "file",
        data: null,
      },
    ],
  })

  const result2 = await components.create({
    groupName: "Page Content",
    rows: [
      {
        displayName: "Headline",
        slug: "headline",
        type: "text",
        data: null,
      },
      {
        displayName: "Subline",
        slug: "subline",
        type: "text",
        data: null,
      },
      {
        displayName: "Excerpt",
        slug: "excerpt",
        type: "text",
        data: null,
      },
      {
        displayName: "Content",
        slug: "content",
        type: "text",
        data: null,
      },
    ],
  })

  const postComponent = await components.create({
    groupName: "Basic Post",
    rows: [
      {
        displayName: "Seo Metadata",
        slug: "seo-metadata",
        type: "component",
        data: {
          componentId: result["insertedId"].toString(),
        },
      },
      {
        displayName: "Page Content",
        slug: "content",
        type: "component",
        data: {
          componentId: result2["insertedId"].toString(),
        },
      },
    ],
  })

  await contentTypes.create({
    name: "Basic Page",
    slug: "basic-page",
    fields: [
      {
        groupName: "Content",
        rows: [
          {
            displayName: "Main Text",
            slug: "mainText",
            type: "component",
            data: {
              componentId: postComponent["insertedId"],
            },
          },
        ],
      },
    ],
  })

  const result3 = await components.create({
    groupName: 'Author',
    rows: [
      {
        name: 'Nested Author Fields',
        slug: "nested-component",
        type: 'component',
        data: {
          componentId: result['insertedId'].toString()
        }
      }
    ]
  })
} 