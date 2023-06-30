import components from '@repo/components'

export const seedComponents = async () => {
  const result = await components.create({
    groupName: "Seo Metadata",
    rows: [
      {
        displayName: "Title",
        label: "title",
        type: "text",
        data: null,
      },
      {
        displayName: "Description",
        label: "description",
        type: "text",
        data: null,
      },
      {
        displayName: "Image",
        label: "image",
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
        label: "headline",
        type: "text",
        data: null,
      },
      {
        displayName: "Subline",
        label: "subline",
        type: "text",
        data: null,
      },
      {
        displayName: "Excerpt",
        label: "excerpt",
        type: "text",
        data: null,
      },
      {
        displayName: "Content",
        label: "content",
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
        label: "seo-metadata",
        type: "component",
        data: {
          componentId: result["insertedId"].toString(),
        },
      },
      {
        displayName: "Page Content",
        label: "content",
        type: "component",
        data: {
          componentId: result2["insertedId"].toString(),
        },
      },
    ],
  })

  // await contentType.create({
  //   displayName: "Basic Page",
  //   fields: [
  //     {
  //       groupName: "Content",
  //       rows: [
  //         {
  //           name: "content",
  //           label: "content",
  //           type: "component",
  //           data: {
  //             componentId: postComponent['insertedId']
  //           }
  //         }
  //       ]
  //     }
  //   ]
  // })

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