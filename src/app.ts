import "./config"
import cmsAPI from "~/api/cms"
import "~/middleware/auth"
import fastify from "fastify"
import repo from "~/repo"
import publicApiAuth from "~/api/public"
import fastifyPlugin from "fastify-plugin"
import cmsApiSchema from "~/schema/cms-api"

const app = fastify({
  logger: {
    level: "info",
    file: "./server.log",
  },
})

app.register(fastifyPlugin(cmsApiSchema))

app.register(fastifyPlugin(repo), {
  dbName: process.env.DB_NAME || "plenty_cms",
})

app.get("/health", (_r, reply) => {
  reply.code(200).send({})
})

app.register(cmsAPI)
app.register(publicApiAuth)

export default app
