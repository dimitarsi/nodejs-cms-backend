import controller from "./controller"
import auth from "../middleware/auth"
import express from "express"

const app = express()

app.use(auth)
app.use(controller("fields"))

export default app