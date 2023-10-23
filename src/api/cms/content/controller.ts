import contentRepo from "@repo/content"
import { createCrudController } from "~/core/api/crud/controller"
import { getConfig } from "./actions/getConfig"
import { search } from "./actions/search"
import { crudRoutes } from "~/core/api/crud/router"

export const ContentController = createCrudController(contentRepo, {
  getConfig,
  search,
})

const routes = crudRoutes(`/content/`, ContentController)

routes.get("/search", ContentController("search"))
routes.get(":id/config", ContentController("getConfig"))

export default routes
