import dbConnector from "@db"
// import express from "express"
import "./config"
import bodyParser from "body-parser"
import cors from "cors"
import publicAPI from "~/api/public"
import cmsAPI from "~/api/cms"
import errorHandler from "@api/error"
import Router from "./core/api/router"
import "~/middleware/auth"
import "~/middleware/devEnv"
import fastify from "fastify"
// import dbConnector from "@db"
import dbLayer from "~/repo"
import publicApiAuth from "~/api/public/auth"
import fastifyPlugin from "fastify-plugin"
import attachments from "@api/cms/files"
import media from "@api/public/media"
import users from "@api/cms/user"
import cmsApiSchema from "~/schema/cms-api"

const app = fastify({
  logger: true,
})
const port = parseInt(process.env.PORT || "8000")

// app.use(bodyParser.urlencoded())
// app.use(bodyParser.json())
// app.use(cors())

// const router = Router()
// publicAPI(router)

// app.router.use("auth:isAdmin")
// {
// app.register(dbConnector)

app.register(fastifyPlugin(cmsApiSchema))

app.register(fastifyPlugin(dbLayer), {
  dbName: process.env.DB_NAME || "plenty_cms",
})

app.register(users)
app.register(publicApiAuth)
app.register(media)
app.register(attachments, { uploadDir: "uploads" })

// app.register(cmsAPI)

// }

// app.use(router)
// app.use(errorHandler)

// app.listen(port, () => {
//   console.log(`Listening on http:/localhost:${port}`)
// })

const server = app.listen({
  port: isNaN(port) ? 8000 : port,
})

// console.log("Listening")

export default server
