import { type Handler, type Request, type Response } from "express"
import defaultCreateContext from "./createContext"
import defaultJsonResponseFormatter from "./jsonResponseFormatter"

export interface Action<Context, Result> {
  (ctx: Context): Awaited<Result>
}

export type Actions<C, R> = Record<string, Action<C, R>>

export const createController =
  <
    C,
    R extends Record<string, any> = {},
    A extends Action<C, R> = Action<C, R>,
    TObj extends Record<string, Action<C, R>> = Record<string, A>,
    TKey extends keyof TObj = keyof TObj
  >(
    actions: TObj,
    contextFactory?: (req: Request) => C,
    responseFormatter?: (res: Response, result: Awaited<R>) => void
  ) =>
  (action: TKey): Handler =>
  async (req, res, _next) => {
    const method = actions[action] as Action<C, R>
    const createContext = contextFactory || defaultCreateContext
    const response = responseFormatter || defaultJsonResponseFormatter

    const context: C = createContext(req)

    const result = await method(context)

    response(res, result)
  }
