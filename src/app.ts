import "./config"
import cmsAPI from "~/api/cms"
import "~/middleware/auth"
import fastify from "fastify"
import repo from "~/repo"
import publicApiAuth from "~/api/public"
import fastifyPlugin from "fastify-plugin"
import cmsApiSchema from "~/schema/cmsAPISchema"
import services from "~/services/register"

const app = fastify({
  logger: {
    level: "info",
    file: "./server.log",
  },
})

app.register(fastifyPlugin(cmsApiSchema))

app
  .register(fastifyPlugin(repo), {
    dbName: process.env.DB_NAME || "plenty_cms",
  })
  .then(() => {
    app.register(fastifyPlugin(services))
  })

app.get("/health", (_r, reply) => {
  reply.code(200).send({})
})

app.register(cmsAPI)
app.register(publicApiAuth)

export default app
