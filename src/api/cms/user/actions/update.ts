import { FastifyInstance, RouteShorthandOptions } from "fastify"
import { UpdateResult } from "mongodb"
import { schemaRef } from "~/schema/cmsAPISchema"
import { shouldUpdateFirstAndLastName, shouldUpdatePassword } from "../helpers"

export default function updateUser(instance: FastifyInstance) {
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
    }

    if (shouldUpdateFirstAndLastName(body)) {
      result = await instance.users.update(id, body)
    }

    if (!result || result.matchedCount === 0) {
      reply.code(404)
    }

    reply.send()
  })
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
