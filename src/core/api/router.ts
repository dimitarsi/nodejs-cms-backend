import { Router as ExpressRouter } from "express"
import { textRouteReporter } from "../reporters/textRouteReporter"

const spiedProperties = ["get", "post", "patch", "put", "delete", "any"]

const middlewares: Array<{ name: string; handler: Function }> = []

export function registerMiddleware(
  middlewareName: string,
  middlewareHandler: Function
) {
  middlewares.push({
    name: middlewareName,
    handler: middlewareHandler,
  })
}

export default function Router(mounthpath: string = "") {
  const router = ExpressRouter()
  const registeredMiddlewares: string[] = []
  const routerProxy: typeof router = new Proxy(router, {
    get(target, p) {
      if (p === "use") {
        // @ts-ignore
        return (...args) => {
          const rest = args.slice(0, -1)
          const lastArg = args.slice(-1)
          const middleware =
            lastArg.length &&
            typeof lastArg[0] === "string" &&
            middlewares.find((m) => m.name === lastArg[0])?.handler

          if (middleware) {
            registeredMiddlewares.push(middleware.name)
          }

          // @ts-ignore
          return target[p].apply(
            target,
            // @ts-ignore
            middleware ? [...rest, middleware] : args
          )
        }
      }

      if (spiedProperties.includes(p.toString())) {
        // @ts-ignore
        return (...args) => {
          textRouteReporter(
            `${p.toString()}`,
            mounthpath,
            registeredMiddlewares,
            args
          )
          // @ts-ignore
          return target[p].apply(target, args)
        }
      }

      // @ts-ignore
      return target[p]
    },
    // Each time a router handles a request this function is called
    async apply(target, _thisArg, argArray) {
      // @ts-ignore
      const result = await target(...argArray)
      return result
    },
  })

  return routerProxy
}
