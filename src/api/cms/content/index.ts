import contentTypesRepo from "@repo/contentTypes"
import contentRepo from "@repo/content"
import defaultController from "~/core/api/controller"
import express from "express"
import ajv from "~/schema/core"
import { type JSONSchemaType } from "ajv"
import { Validator } from "~/core/api/request"
import Router from "~/core/api/router"

const router = Router("/content")

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
      found: { in: contentTypesRepo.collectionName(), optional: true },
    },
    name: {
      type: "string",
    },
    slug: {
      type: "string",
      found: {
        in: "stories:slug",
        notIn: true,
      },
    },
    type: {
      enum: ["folder", "document"],
    },
    folder: {
      type: "string",
    },
    data: {
      type: "object",
      properties: {},
    },
  },
})

const validateRequestBody: Validator = (req: express.Request) => {
  return undefined

  // return validate(req.body).then(_result => {
  //   return undefined
  // }).catch((err) => {
  //   return err;
  // })
}

router.get("/search", async function search(req, res) {
  const page = parseInt(req.query["page"]?.toString() || "1")
  const folderName: string | Record<string, any> = req.query["folder"] || "/"

  let folderQuery: Record<string, any> = {}

  if (typeof folderName === "string") {
    folderQuery = { folderLocation: folderName }
  } else if (
    typeof folderName === "object" &&
    typeof folderName?.["like"] === "string"
  ) {
    folderQuery = {
      folderLocation: new RegExp(`${folderName?.["like"]?.toString()}`),
    }
  } else if (
    typeof folderName === "object" &&
    typeof folderName?.["startsWith"] === "string"
  ) {
    folderQuery = {
      folderLocation: new RegExp(
        `^${folderName?.["startsWith"]?.toString()}.?`
      ),
    }
  }

  res.json(
    await contentRepo.getAll(isNaN(page) ? 1 : Math.max(1, page), {
      pageSize: 20,
      filter: folderQuery,
    })
  )
})

router.get("/:id/config", async function getContentConfig(req, res) {
  const id = req.params["id"]

  const content = await contentRepo.getById(id)

  if (content == null || !content.configId) {
    res.status(404).json({
      message: "Could not find item with idOrSlug: " + id,
    })
    return
  }

  const config = await contentTypesRepo.getById(content.configId)

  res.json(config)
})

defaultController(router, contentRepo, {
  create: validateRequestBody,
  // update: validateRequestBody,
})

export default router
