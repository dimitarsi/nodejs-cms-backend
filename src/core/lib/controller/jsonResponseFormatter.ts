import { type Response } from "express"

export const jsonResponseFormatter = <R>(res: Response, result: R) => {
  if (!result) {
    res.status(404).json({ message: "not found" })
    return
  }

  res.status(200).json(result)
}

export default jsonResponseFormatter
