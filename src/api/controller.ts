import express, { Application } from "express"
import crud from "../repo/crud"
import { ErrorObject } from "ajv"

type ExtendCrud = Parameters<typeof crud>[1]
type DefaultRoutes = "getAll" | "getById" | "create" | "update" | "delete"
export type Validator =
  | ((req: express.Request) => Promise<ErrorObject[] | null | undefined | true>)
  | undefined
export type DefaultRoutesValidation = Record<DefaultRoutes, Validator>
export type PartialDefaultRoutesValidation = Partial<DefaultRoutesValidation>

const validateRequest =
  (validate?: PartialDefaultRoutesValidation) =>
  async (route: DefaultRoutes, req: express.Request, res: express.Response) => {
    const errors = await validate?.[route]?.(req)

    if (errors && typeof errors === "object") {
      res.statusCode = 403
      res.json(errors || {})
    }

    return errors === undefined
  }

export const withDefaultRoutes = (
  app: Application,
  repo: Record<string, Function>,
  validate?: PartialDefaultRoutesValidation
) => {
  const guard = validateRequest(validate)

  const routes: Record<string, express.Handler> = {
    getAll: async (req, res) => {
      const page = parseInt(req.query["page"]?.toString() || "1")
      res.json(await repo.getAll(isNaN(page) ? 1 : Math.max(1, page)))
    },
    getById: async (req, res) => {
      const valid = await guard("getById", req, res)

      if (valid) {
        res.json(await repo.getById(req.params.id))
      }
    },
    create: async (req, res) => {
      const valid = await guard("create", req, res)

      if (valid) {
        const result = await repo.create(req.body)
        res.json({
          id: result.insertedId,
        })
      }
    },
    update: async (req, res) => {
      const valid = await guard("update", req, res)
      if (valid) {
        const result = await repo.update(req.params.id, req.body)

        res.json({
          matched: result.matchedCount,
        })
      }
    },
    delete: async (req, res) => {
      const valid = await guard("delete", req, res)

      if (valid) {
        const resp = await repo.deleteById(req.params.id)
        res.json({
          status:
            resp.deletedCount > 0 ? "deleted" : `${req.params.id} not found`,
        })
      }
    },
  }

  app.get("/", routes.getAll)
  app.get("/:id", routes.getById)
  app.post("/", routes.create)
  app.patch("/:id", routes.update)
  app.delete("/:id", routes.delete)

  return app
}

export const scaffold = <T extends Object>(
  collectionName: string,
  extend?: ExtendCrud,
  validate?: DefaultRoutesValidation
) => {
  const crudOptions = [{ softDelete: false }]

  if (extend) {
    crudOptions.push(extend)
  }

  const repo = crud<T>(collectionName, ...crudOptions)
  const app = express()

  return withDefaultRoutes(app, repo, validate)
}

export default scaffold
