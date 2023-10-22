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

export function createCrudController(
  repo: Record<string, Function>,
  actions: Record<string, (this: Controller) => any>
) {
  const crudActions = {
    create,
    deleteAction,
    update,
    getById,
    getAll,
    ...actions,
  }

  const availableActions = Object.keys(crudActions)

  const controller =
    (action: keyof typeof crudActions): Handler =>
    (req, res, next) => {
      if (!availableActions.includes(action)) {
        next()
        return
      }

      const context: Controller = {
        repo,
        request: req,
        body: req.body,
        id: req.params?.id,
        params: req.params,
        getPage: () => getPage(req.query),
      }

      const result = actions[action].apply(context)

      // Can return '0' and false
      if (result === null || typeof result === "undefined") {
        res.status(404)
      } else {
        res.json(result)
      }
    }

  return controller
}
