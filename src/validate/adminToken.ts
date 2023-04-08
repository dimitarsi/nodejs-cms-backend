import { JSONSchemaType } from "ajv"
import ajv from "~/schema/core"
import express from "express"

export const validateAdminToken = ajv.compile<JSONSchemaType<string>>({
  $async: true,
  type: "string",
  isAdmin: true,
})

export const validateAdminTokenRequest = (req: express.Request) =>
  validateAdminToken(req.headers["x-access-token"])
