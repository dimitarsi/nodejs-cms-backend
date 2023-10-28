const expectedPathLength = 20
export function textRouteReporter(
  method: string | symbol,
  mounthpath: string | string[],
  middlewares: string[],
  handlers: any[]
) {
  const middleware = middlewares.length ? `( ${middlewares.join(",")} )` : ""
  const httpMethod = `[${method.toString().toUpperCase()}]`.padEnd(8, " ")
  const path = `${mounthpath}${handlers.slice(0, -1)?.[0]}`.padEnd(
    expectedPathLength,
    " "
  )
  const httpHandler = handlers.slice(-1)[0]

  let handlerName = httpHandler.toString()
  if (handlerName.includes("function")) {
    handlerName = httpHandler.name
  }

  const routeInfo = `${httpMethod} ${path} ${middleware}`.padEnd(50, " ")

  console.log(`Route ${routeInfo}  -> ${handlerName}`)
}
