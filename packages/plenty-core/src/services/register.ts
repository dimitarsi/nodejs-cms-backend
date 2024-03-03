import { FastifyInstance } from "fastify"
import createUserService from "./users"
import createContentService from "./content"

export default function registerServices(
  instance: FastifyInstance,
  _options: never,
  done: Function
) {
  const contentService = createContentService(instance)
  const usersService = createUserService(instance)

  instance.decorate("services", {
    contentService,
    usersService,
  })

  done()
}

declare module "fastify" {
  interface FastifyInstance {
    services: {
      contentService: ReturnType<typeof createContentService>
      usersService: ReturnType<typeof createUserService>
    }
  }
}
