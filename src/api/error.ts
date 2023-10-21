import { Handler } from "express"

const errorHandler: Handler = (req, res) => {
  res.status(404).send("Not Found")
}

export default errorHandler
