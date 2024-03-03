import "./config"
import cmsAPI from "~/api/cms"
import "~/middleware/auth"
import fastify from "fastify"
import repo from "~/repo"
import publicApiAuth from "~/api/public"
import fastifyPlugin from "fastify-plugin"
import cmsApiSchema from "~/schema/cmsAPISchema"
import services from "~/services/register"
import fastifySensible from "@fastify/sensible"
import successResponses from "./plugins/successResponses"

const app = fastify({
  logger: {
    level: "info",
    file: "./server.log",
  },
})

app.register(fastifyPlugin(successResponses))
app.register(fastifyPlugin(fastifySensible))
app.register(fastifyPlugin(cmsApiSchema))
app.register(fastifyPlugin(repo), {
  dbName: process.env.DB_NAME || "plenty_cms",
})

app.register(fastifyPlugin(services))

app.register(cmsAPI)
app.register(publicApiAuth)

app.get("/health", (_r, reply) => reply.status(200).send("OK"))

export default app
