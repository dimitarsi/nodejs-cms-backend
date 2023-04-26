import express, { Application } from "express"
import { PartialDefaultRoutesValidation, validateRequest } from "./request"

const tap = (method: Function, space?: string) => (...args: any[]) => {
  console.log('tapInto ', space || method.name || 'method');
  return method(...args)
}


const defaultController = (
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
  app.get("/:id", tap(routes.getById))
  app.post("/", routes.create)
  app.patch("/:id", routes.update)
  app.delete("/:id", routes.delete)

  return app
}


export default defaultController