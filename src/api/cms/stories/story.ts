import defaultController from "~/core/api/controller"
import express from "express"
import stories from "~/repo/stories"
import ajv from "~/schema/core"
import { type JSONSchemaType } from "ajv"

const app = express()

const validate = ajv.compile<
  JSONSchemaType<{
    configId: string
    name: string
    slug: string
    data: Record<string, any>
  }>
>({
  $async: true,
  type: "object",
  properties: {
    configId: {
      type: ["string", "null"],
      found: { in: "storiesConfig", optional: true },
    },
    name: {
      type: "string",
    },
    slug: {
      type: "string",
      found: {
        in: "stories:slug", notIn: true
      }
    },
    type: {
      enum: ["folder", "document"]
    },
    folder: {
      type: "string"
    },
    data: {
      type: "object",
      properties: {},
    },
  },
})

const validateRequestBody = (req: express.Request) => {
  return validate(req.body).then(_result => {
    return undefined
  }).catch((err) => {
    return err;
  })
}

app.get('/search', async (req, res) => {
  const page = parseInt(req.query["page"]?.toString() || "1")
  const folderName = req.query["folder"] || '/'

  let folderQuery: Record<string, any> = {};
  
  if(typeof folderName === 'string') {
    folderQuery = {folder: folderName}
  // @ts-ignore
  } else if(typeof folderName === 'object' && typeof folderName?.['like'] === 'string') {
  // @ts-ignore
    folderQuery = {folder: new RegExp(`${folderName?.['like']?.toString()}`)}
  // @ts-ignore
  } else if(typeof folderName === 'object' && typeof folderName?.['startsWith'] === 'string') {
  // @ts-ignore
    folderQuery = {folder: new RegExp(`^${folderName?.['startsWith']?.toString()}.?`)}
  }

  res.json(await stories.getAll(isNaN(page) ? 1 : Math.max(1, page), {
    pageSize: 20,
    filter: folderQuery
  }))
});

defaultController(app, stories, {
  create: validateRequestBody,
  // update: validateRequestBody,
})

export default app
