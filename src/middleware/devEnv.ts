import { Handler } from "express"
import { registerMiddleware } from "~/core/api/router"

const devOnlyHandler: Handler = (_, res, next) => {
  if (process.env.NODE_ENV !== "production") {
    res.status(403).send("Forbidden")
    return
  }

  next()
}

registerMiddleware("devOnlyEnv", devOnlyHandler)

export default devOnlyHandler
