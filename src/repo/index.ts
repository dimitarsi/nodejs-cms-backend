import { FastifyInstance, FastifyPluginAsync } from "fastify"
import users from "./users"
import contents from "./contents"
import contentTypes from "./contentTypes"
import media from "./media"
import auth from "./auth"
import accessTokens from "./accessTokens"
import mongoClient from "@db"
import projects from "./projects"
import invitations from "./invitations"
import permissions from "./permissions"

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
  instance.decorate("projects", projects(db))
  instance.decorate("invitations", invitations(db))
  instance.decorate("permissions", permissions(db))

  instance.addHook("onClose", () => {
    mongoClient.close()
  })

  process.on("beforeExit", () => {
    mongoClient.close()
  })

  done()
}

export default repo as FastifyPluginAsync<PluginOptions>

export type ContentsRepo = ReturnType<typeof contents>
export type ContentTypesRepo = ReturnType<typeof contentTypes>
export type UsersRepo = ReturnType<typeof users>
export type AccessTokenRepo = ReturnType<typeof accessTokens>
export type ProjectsRepo = ReturnType<typeof projects>
export type AuthRepo = ReturnType<typeof auth>
export type MediaRepo = ReturnType<typeof media>
export type InvitationsRepo = ReturnType<typeof invitations>
export type PermissionsRepo = ReturnType<typeof permissions>

declare module "fastify" {
  interface FastifyInstance {
    contents: ContentsRepo
    accessToken: AccessTokenRepo
    media: MediaRepo
    users: UsersRepo
    auth: AuthRepo
    contentTypes: ContentTypesRepo
    projects: ProjectsRepo
    invitations: InvitationsRepo
    permissions: PermissionsRepo
  }
}
