import { FastifyInstance, RouteShorthandOptions } from "fastify"
import auth from "@middleware/auth"
import { UpdateResult } from "mongodb"
import { schemaRef } from "~/schema/cms-api"
import { User } from "~/models/user"
import { getAllUsers } from "./actions/getAll"

// const oldController = (
//   router: ReturnType<typeof fastify>,
//   prefix: `/${string}/` | "/" = "/"
// ) => {
//   defaultController(
//     router,
//     {
//       ...users,
//       create(data: User) {
//         return users.create({
//           isActive: false,
//           isAdmin: false,
//           firstName: data.firstName,
//           lastName: data.lastName,
//           email: data.email,
//           password: data.password,
//         })
//       },
//     },
//     {
//       create: async (req: express.Request) => {
//         try {
//           await validateCreateUser(req.body)
//           return undefined
//         } catch (e) {
//           return (e as any).errors
//         }
//       },
//     },
//     prefix
//   )

//   router.post(`${prefix}:id/activate`, async function activateUser(req, reply) {
//     try {
//       const valid = await validateIsInactive(req.params)

//       if (!valid) {
//         reply.statusCode = 405
//         reply.send(validateIsInactive.errors)
//         return
//       }
//     } catch (er) {
//       reply.statusCode = 500
//       reply.send({
//         error: er,
//       })
//       return
//     }

//     await users.activate(req.params.id)

//     reply.send({ success: true })
//   })
// }

const getByIdOptions: RouteShorthandOptions = {
  schema: {
    params: schemaRef("idParamStrict"),
  },
}

const createUserOptions: RouteShorthandOptions = {
  schema: {
    body: schemaRef("userCreatePayload"),
  },
}

const updatePassword = {
  type: "object",
  properties: {
    password: { type: "string" },
    confirmPassword: { type: "string" },
  },
  additionalProperties: false,
  required: ["password", "confirmPassword"],
}

const updateUserData = {
  type: "object",
  properties: {
    firstName: { type: "string" },
    lastName: { type: "string" },
  },
  additionalProperties: false,
  required: [],
}

const updateUserOptions: RouteShorthandOptions = {
  schema: {
    params: schemaRef("idParamStrict"),
    body: {
      oneOf: [updatePassword, updateUserData],
    },
  },
}

const activateOptions: RouteShorthandOptions = {
  schema: {
    params: schemaRef("idParamStrict"),
    querystring: schemaRef("hashQueryStrict"),
  },
}

export default function (
  instance: FastifyInstance,
  options: never,
  done: Function
) {
  instance.register(auth, { isAdmin: true })

  getAllUsers(instance)

  instance.get<{
    Params: { id: string }
  }>("/users/:id", getByIdOptions, async (req, reply) => {
    reply.send(await instance.users.getById(req.params.id))
  })
  instance.post<{
    Body: User
  }>("/users", createUserOptions, async (req, reply) => {
    const body = req.body

    const result = await instance.users.create({
      isActive: false,
      isAdmin: false,
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      password: body.password,
    })

    reply.code(201).header("location", `/user/${result.insertedId}`).send({
      id: result.insertedId,
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
    })
  })

  instance.patch<{
    Body:
      | {
          password: string
          confirmPassword: string
        }
      | {
          firstName: string
          lastName: string
        }
    Params: {
      id: string
    }
  }>("/users/:id", updateUserOptions, async (req, reply) => {
    const body = req.body
    const id = req.params.id
    let result: UpdateResult | null = null

    if (shouldUpdatePassword(body)) {
      result = await instance.users.update(id, { password: body.password })
    } else if (shouldUpdateFirstAndLastName(body)) {
      result = await instance.users.update(id, body)
    }

    if (!result || result.matchedCount === 0) {
      reply.code(404)
    }

    reply.send()
  })

  instance.delete<{
    Params: { id: string }
  }>("/users/:id", getByIdOptions, async (req, reply) => {
    const id = req.params.id
    const result = await instance.users.deleteById(id)

    if (!result?.result.acknowledged) {
      reply.code(404)
    }

    reply.send()
  })

  instance.get<{
    Params: { id: string }
    Querystring: { hash: string }
  }>("/users/:id/activate", activateOptions, async (req, reply) => {
    const id = req.params.id

    const result = await instance.users.selfActivate(id, req.query.hash)

    if (!result) {
      reply.code(404)
    }

    reply.send()
  })

  done()
}

function shouldUpdateFirstAndLastName(
  data: Record<string, string>
): data is { firstName: string; lastName: string } {
  return Boolean(data["firstName"] || data["lastName"])
}

function shouldUpdatePassword(
  data: Record<string, string>
): data is { password: string; confirmPassword: string } {
  return Boolean(
    data["password"] &&
      data["confirmPassword"] &&
      data["password"].length > 8 &&
      data["password"] === data["confirmPassword"]
  )
}
