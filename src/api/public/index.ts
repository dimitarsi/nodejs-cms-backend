import { handler } from "./../../middleware/auth"
import auth from "./auth"
import Router from "~/core/api/router"
import { mediaHandler } from "./media"
import revokeAccessTokens from "./revokeAccessTokens"

export default (router: ReturnType<typeof Router>) => {
  auth(router)
  router.get("/media/:hash", mediaHandler)

  const devRouter = Router()
  devRouter.use("devOnlyEnv")
  revokeAccessTokens(devRouter)

  router.use(devRouter)
}
