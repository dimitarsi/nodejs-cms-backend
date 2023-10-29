import defaultController from "~/core/api/controller"
import users from "~/repo/users"
import express from "express"
import { validateIsInactive, validateCreateUser } from "./schema"
import { User } from "~/models/user"
import fastify, { FastifyInstance, RouteShorthandOptions } from "fastify"
import auth from "@middleware/auth"

const oldController = (
  router: ReturnType<typeof fastify>,
  prefix: `/${string}/` | "/" = "/"
) => {
  defaultController(
    router,
    {
      ...users,
      create(data: User) {
        return users.create({
          isActive: false,
          isAdmin: false,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
        })
      },
    },
    {
      create: async (req: express.Request) => {
        try {
          await validateCreateUser(req.body)
          return undefined
        } catch (e) {
          return (e as any).errors
        }
      },
    },
    prefix
  )

  router.post(`${prefix}:id/activate`, async function activateUser(req, reply) {
    try {
      const valid = await validateIsInactive(req.params)

      if (!valid) {
        reply.statusCode = 405
        reply.send(validateIsInactive.errors)
        return
      }
    } catch (er) {
      reply.statusCode = 500
      reply.send({
        error: er,
      })
      return
    }

    await users.activate(req.params.id)

    reply.send({ success: true })
  })
}

const opts: RouteShorthandOptions = {
  schema: {
    params: {
      type: "object",
      properties: {
        id: { type: "string" },
      },
    },
  },
}

const getAllOpts: RouteShorthandOptions = {
  schema: {
    querystring: {
      type: "object",
      properties: {
        page: { type: "number" },
        perPage: { type: "number" },
      },
    },
  },
}

export default function (
  instance: FastifyInstance,
  options: never,
  done: Function
) {
  instance.register(auth, { isAdmin: true })

  instance.get("/user", async (_req, reply) => {
    const users = await instance.users.getAll()

    reply.send(users)
  })

  instance.get<{
    Params: { id: string }
  }>("/user/:id", getAllOpts, async (req, reply) => {
    reply.send(await instance.users.getById(req.params.id))
  })
  instance.post("/user", opts, (req, reply) => {
    return req.body
  })
  instance.patch("/user/:id", () => {})
  instance.delete("/user/:id", () => {})
  instance.delete("/user/:id/activate", () => {})

  done()
}
