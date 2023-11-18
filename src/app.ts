import "./config"
import cmsAPI from "~/api/cms"
import "~/middleware/auth"
import "~/middleware/devEnv"
import fastify, { FastifyPluginCallback } from "fastify"
import dbLayer from "~/repo"
import publicApiAuth from "~/api/public"
import fastifyPlugin from "fastify-plugin"
// import attachments from "@api/cms/files"
// import media from "@api/public/media"
import cmsApiSchema from "~/schema/cms-api"
// import mediaPlugin from "@api/media"

const app = fastify({
  logger: true,
})

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

app.get("/health", (_r, reply) => {
  reply.code(200).send({})
})

app.register(cmsAPI)
app.register(publicApiAuth)

// app.register(mediaPlugin)
// app.register(media)
// app.register(attachments, { uploadDir: "uploads" })

export default app
