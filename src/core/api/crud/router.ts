import { type Handler } from "express"
import Router from "../router"

export function crudRoutes(
  path: `/${string}/` | "/",
  controller: (action: any) => Handler
) {
  const router = Router()
  const root = path === "/" ? path : path.replace(/\/$/, "")

  router.get(`${root}`, controller("getAll"))
  router.get(`${path}:id`, controller("getById"))
  router.post(`${path}`, controller("create"))
  router.patch(`${path}:id`, controller("update"))
  router.delete(`${path}:id`, controller("delete"))

  return router
}
