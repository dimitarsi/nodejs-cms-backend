import { FastifyInstance, FastifyPluginAsync } from "fastify"
import users from "./users"
import contents from "./contents"
import contentTypes from "./contentTypes"
import media from "./media"
import auth from "./auth"
import accessTokens from "./accessTokens"
import mongoClient from "@db"

interface PluginOptions {
  dbName: string
}

async function repo(
  instance: FastifyInstance,
  options: PluginOptions,
  done: Function
) {
  const db = await mongoClient.db(options.dbName)

  instance.decorate("users", users(db))
  instance.decorate("contents", contents(db))
  instance.decorate("contentTypes", contentTypes(db))
  instance.decorate("media", media(db))
  instance.decorate("auth", auth(db))
  instance.decorate("accessToken", accessTokens(db))

  instance.addHook("onClose", () => {
    mongoClient.close()
  })

  process.on("beforeExit", () => {
    mongoClient.close()
  })

  done()
}

export default repo as FastifyPluginAsync<PluginOptions>

declare module "fastify" {
  interface FastifyInstance {
    contents: ReturnType<typeof contents>
    accessToken: ReturnType<typeof accessTokens>
    media: ReturnType<typeof media>
    users: ReturnType<typeof users>
    auth: ReturnType<typeof auth>
    contentTypes: ReturnType<typeof contentTypes>
  }
}
