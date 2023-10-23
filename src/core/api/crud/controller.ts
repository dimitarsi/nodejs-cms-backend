import { create } from "./actions/create"
import { deleteAction } from "./actions/delete"
import { update } from "./actions/update"
import { getById } from "./actions/getById"
import { getAll } from "./actions/getAll"
import { Controller } from "./actions/types"
import { type Handler, type Request } from "express"

function getPage(query: Request["query"]) {
  const page = parseInt(query["page"]?.toString() || "1")
  return isNaN(page) ? 1 : Math.max(1, page)
}

export function createCrudController<
  R,
  T extends Record<string, (this: Controller<R>) => any>,
  K extends keyof T,
  ALL_KEYS extends
    | K
    | "create"
    | "deleteAction"
    | "update"
    | "getById"
    | "getAll"
>(repo: R, actions?: T) {
  const crudActions = {
    create,
    deleteAction,
    update,
    getById,
    getAll,
    ...(actions || {}),
  }

  const availableActions = Object.keys(crudActions) as ALL_KEYS[]

  const controller =
    (action: ALL_KEYS): Handler =>
    (req, res, next) => {
      if (!availableActions.includes(action)) {
        next()
        return
      }

      const context: Controller<R> = {
        repo,
        request: req,
        body: req.body,
        id: req.params?.id,
        params: req.params,
        getPage: () => getPage(req.query),
      }

      // @ts-ignore
      const result = crudActions[action].apply(context)

      if (result === null || typeof result === "undefined") {
        res.status(404).json({ message: "Not Found" })
        return
      }

      if (action === "create") {
        res.statusCode = 201
      }

      res.json(result)
    }

  return controller
}
