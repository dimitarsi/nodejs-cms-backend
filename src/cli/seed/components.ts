import components from '@repo/components'
import contentType from '@repo/storyConfigs'

export const seedComponents = async () => {
  const result = await components.create({
    groupName: "Seo Metadata",
    rows: [
      {
        name: 'Title',
        label: 'title',
        type: "text",
        data: null
      },
      {
        name: 'Description',
        label: 'description',
        type: "text",
        data: null
      },
      {
        name: 'Image',
        label: 'image',
        type: "files",
        data: null
      },
    ]
  })

  const result2 = await components.create({
    groupName: "Page Content",
    rows: [
      {
        name: 'Headline',
        label: 'headline',
        type: "text",
        data: null
      },
      {
        name: 'Subline',
        label: 'subline',
        type: "text",
        data: null
      },
      {
        name: 'Excerpt',
        label: 'excerpt',
        type: "text",
        data: null
      },
      {
        name: 'Content',
        label: 'content',
        type: "text",
        data: null
      },
    ]
  })

  const postComponent = await components.create({
    groupName: 'Basic Post',
    rows: [
      {
        name: "Seo Metadata",
        label: "seo-metadata",
        type: "component",
        data: {
          componentId: result['insertedId'].toString()
        }
      },
      {
        name: "Page Content",
        label: "content",
        type: "component",
        data: {
          componentId: result2['insertedId'].toString()
        }
      }
    ]
  })

  await contentType.create({
    name: "Basic Page",
    fields: [
      {
        groupName: "Content",
        rows: [
          {
            name: "content",
            label: "content",
            type: "component",
            data: {
              componentId: postComponent['insertedId']
            }
          }
        ]
      }
    ]
  })

  // const result3 = await components.create({
  //   groupName: 'Author',
  //   rows: [
  //     {
  //       name: '',
  //       label: "nested-component",
  //       type: 'component',
  //       data: {
  //         componentId: result['insertedId'].toString()
  //       }
  //     }
  //   ]
  // })
} 