import type Router from "~/core/api/router"
import user from "./user"
import content from "./content"
import contentTypes from "./contentTypes"
import attachments from "./files"

export default (router: ReturnType<typeof Router>) => {
  user(router, "/user/")
  attachments(router, "/attachments/")
  content(router, "/content/")
  contentTypes(router, "/content_types/")
}
