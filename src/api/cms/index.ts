// import { cmsAPI } from '~/api/cms';
// import { cmsAPI } from '~/api/cms';
// import type Router from "~/core/api/router"
// import user from "./user"
// import content from "./content"
// import contentTypes from "./contentTypes"
// import attachments from "./files"
// import fastify from "fastify"

// export default (router: Fastify) => {
//   user(router, "/user/")
//   // attachments(router, "/attachments/")
//   // content(router, "/content/")
//   // contentTypes(router, "/content_types/")
// }
import fastifyPlugin from "fastify-plugin"
import { FastifyInstance, RouteShorthandOptions } from "fastify"
// import { baseCrudMethods } from "@repo/crud"
// import { User } from "~/models/user"
import user from "./user"

async function cmsAPI(
  fastify: FastifyInstance,
  options: never,
  done: Function
) {
  // const userCollection = fastify.mongo.db!.collection<User>("user")
  // const userRepo = baseCrudMethods<User>(userCollection, { softDelete: false })

  const opts: RouteShorthandOptions = {
    schema: {
      body: {
        type: "object",
        properties: {
          name: { type: "string" },
          title: { type: "string" },
        },
      },
      response: {
        200: {
          type: "object",
          properties: {
            hello: { type: "string" },
          },
        },
      },
    },
  }

  fastify.register(user)

  done()
}

export default fastifyPlugin(cmsAPI)
