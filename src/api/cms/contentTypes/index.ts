import express from "express"
import { Validator } from "~/core/api/request"
import defaultController from "~/core/api/controller"
import validate from "./schema"
import contentTypesRepo from "@repo/contentTypes"
import Router from "~/core/api/router"

const router = Router("/content_types")

const validateCreate: Validator = (req: express.Request) => undefined
// validate(req.body).then(_result => undefined).catch(error => error);

defaultController(router, contentTypesRepo, {
  create: validateCreate,
})

export default router
