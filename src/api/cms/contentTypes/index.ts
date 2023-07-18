import express from "express"
import { Validator } from "~/core/api/request"
import defaultController from "~/core/api/controller"
import validate from "./schema"
import contentTypesRepo from "@repo/contentTypes"

const app = express()

const validateCreate: Validator = (req: express.Request) => undefined
  // validate(req.body).then(_result => undefined).catch(error => error);

defaultController(app, contentTypesRepo, {
  create: validateCreate,
})

export default app
