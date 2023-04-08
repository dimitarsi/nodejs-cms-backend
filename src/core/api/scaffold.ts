import crud from "~/repo/crud"
import { DefaultRoutesValidation } from "./request"
import express from "express"
import defaultController from "./controller"

type ExtendCrud = Parameters<typeof crud>[1]

export const scaffold = <T extends Object>(
  collectionName: string,
  extend?: ExtendCrud,
  validate?: DefaultRoutesValidation
) => {
  const crudOptions = [{ softDelete: false }]

  if (extend) {
    crudOptions.push(extend)
  }

  const repo = crud<T>(collectionName, ...crudOptions)
  const app = express()

  return defaultController(app, repo, validate)
}

export default scaffold
