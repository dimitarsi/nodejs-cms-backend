import type Router from "../../core/api/router"
import { type Handler } from "express"
import { PartialDefaultRoutesValidation, validateRequest } from "./request"

function tap(method: Function, space?: string) {
  const Tapped = (...args: any[]) => {
    console.log("tapInto ", space || method.name || "method")
    return method(...args)
  }

  Tapped.toString = function () {
    return `Tapped::DefaultRouter::${method.name}`
  }

  return Tapped
}

function prefixMethodName(prefix: string) {
  return function toString(this: Function) {
    return `${prefix}::${this.name}`
  }
}

const defaultController = (
  router: ReturnType<typeof Router>,
  repo: Record<string, Function>,
  validate?: PartialDefaultRoutesValidation
) => {
  const guard = validateRequest(validate)

  const routes: Record<string, Handler> = {
    async getAll(req, res) {
      const page = parseInt(req.query["page"]?.toString() || "1")
      res.json(await repo.getAll(isNaN(page) ? 1 : Math.max(1, page)))
    },
    async getById(req, res) {
      const valid = await guard("getById", req, res)

      if (valid) {
        const data = await repo.getById(req.params.id)

        if (!data || Object.keys(data).length === 0) {
          res.status(404).json({ message: "Not Found" })
        } else {
          res.json(data)
        }
      }
    },
    async create(req, res) {
      const valid = await guard("create", req, res)

      if (valid) {
        const result = await repo.create(req.body)
        res.json({
          id: result.insertedId,
        })
      }
    },
    async update(req, res) {
      const valid = await guard("update", req, res)
      if (valid) {
        const { _id, ...body } = req.body
        const result = await repo.update(req.params.id, body)

        res.json({
          matched: result.matchedCount,
        })
      }
    },
    async delete(req, res) {
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

  routes.getAll.toString =
    routes.getById.toString =
    routes.create.toString =
    routes.update.toString =
    routes.delete.toString =
      prefixMethodName("DefaultRouter")

  router.get("/", routes.getAll)
  router.get("/:id", tap(routes.getById))
  router.post("/", routes.create)
  router.patch("/:id", routes.update)
  router.delete("/:id", routes.delete)

  return router
}

export default defaultController
