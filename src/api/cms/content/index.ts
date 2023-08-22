import contentTypesRepo from '@repo/contentTypes';
import contentRepo from '@repo/content'
import defaultController from "~/core/api/controller"
import express, { Request, application, query } from "express"
import ajv from "~/schema/core"
import { type JSONSchemaType } from "ajv"
import { Validator } from '~/core/api/request';
import { ObjectId } from 'mongodb';

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

app.get('/search', async (req, res) => {
  const page = parseInt(req.query["page"]?.toString() || "1")
  const folderName = req.query["folder"] || '/'

  let folderQuery: Record<string, any> = {};
  
  if(typeof folderName === 'string') {
    folderQuery = {folderLocation: folderName}
  // @ts-ignore
  } else if(typeof folderName === 'object' && typeof folderName?.['like'] === 'string') {
    folderQuery = {
      // @ts-ignore
      folderLocation: new RegExp(`${folderName?.["like"]?.toString()}`),
    }
  // @ts-ignore
  } else if(typeof folderName === 'object' && typeof folderName?.['startsWith'] === 'string') {
    folderQuery = {
      folderLocation: new RegExp(
        // @ts-ignore
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
});


app.get('/:id/config', async (req, res) => {
  const id = req.params["id"]

  const content = await contentRepo.getById(id)

  if (content == null) {
    res.status(404).json({
      message: "Could not find item with idOrSlug: " +id  
    })
    return;
  }

  const config = await contentTypesRepo.getById(content.configId)

  res.json(config)
})

defaultController(app, contentRepo, {
  create: validateRequestBody,
  // update: validateRequestBody,
})

export default app
