import dbConnector from "@db"
import {
  FastifyInstance,
  FastifyPluginAsync,
  FastifyPluginCallback,
} from "fastify"
import fastifyPlugin from "fastify-plugin"
import users from "./users"
import { FastifyMongoObject } from "@fastify/mongodb"
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
