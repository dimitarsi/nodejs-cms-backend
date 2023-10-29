// import { handler } from "./../../middleware/auth"
import auth from "./auth"
import Router from "~/core/api/router"
import media from "./media"
import revokeAccessTokens from "./revokeAccessTokens"
import fastify, { FastifyInstance } from "fastify"

export default function publicApi(
  instance: FastifyInstance,
  options: never,
  done: Function
) {
  instance.register(auth)
  done()
  // instance.register(media)

  // auth(router)
  // router.get("/media/:hash", (req, reply) => {
  //   mediaHandler(req, reply)
  // })

  // const devRouter = Router()
  // // devRouter.use("devOnlyEnv")
  // revokeAccessTokens(devRouter)

  // router.use(devRouter)
}
