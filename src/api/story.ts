import controller, { withDefaultRoutes } from "./controller";
import auth from '../middleware/auth'
import express from "express";
import stories from "../repo/stories"

const app = express()

app.use(auth)

withDefaultRoutes(app, stories)

export default app;