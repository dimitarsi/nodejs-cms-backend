import express from "express"
import { Validator } from "~/core/api/request"
import defaultController from "~/core/api/controller"
import validate from "./schema"
import storyConfigs from "~/repo/storyConfigs"

const app = express()

const validateCreate: Validator = (req: express.Request) =>
  validate(req.body) ? undefined : validate.errors

defaultController(app, storyConfigs, {
  create: validateCreate,
})

export default app
