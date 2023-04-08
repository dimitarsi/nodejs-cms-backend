import express from "express"
import { DefaultRoutes } from "./routes"
import { ErrorObject } from "ajv"

type ValidatorResult = ErrorObject[] | null | undefined | true
export type Validator =
  | ((req: express.Request) => ValidatorResult | Promise<ValidatorResult>)
  | undefined
export type DefaultRoutesValidation = Record<DefaultRoutes, Validator>

export type PartialDefaultRoutesValidation = Partial<DefaultRoutesValidation>


export const validateRequest =
  (validate?: PartialDefaultRoutesValidation) =>
  async (route: DefaultRoutes, req: express.Request, res: express.Response) => {
    const errors = await validate?.[route]?.(req)

    if (errors && typeof errors === "object") {
      res.statusCode = 403
      res.json(errors || {})
    }

    return errors === undefined
  }
