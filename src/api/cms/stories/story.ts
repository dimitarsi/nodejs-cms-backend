import defaultController from "~/core/api/controller"
import auth from "~/middleware/auth"
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
      type: "string",
      found: { in: "storiesConfig" },
    },
    name: {
      type: "string",
    },
    slug: {
      type: "string",
    },
    data: {
      type: "object",
      properties: {},
    },
  },
})

const validateRequestBody = (req: express.Request) => {
  return validate(req.body).then(_result => undefined).catch((err) => err)
}

defaultController(app, stories, {
  create: validateRequestBody,
  update: validateRequestBody,
})

export default app
