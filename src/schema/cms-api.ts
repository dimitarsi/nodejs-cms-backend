import { FastifyInstance } from "fastify"
import Ajv, { JSONSchemaType } from "ajv"
import createStrict from "./createStrict"
import { User } from "~/models/user"

const schemaId = (url: string) => `cms-api/${url}`

const pageQuery: JSONSchemaType<{ page: number; perPage: number }> = {
  type: "object",
  properties: {
    page: { type: "number", default: 1, minimum: 1 },
    perPage: { type: "number", default: 20, minimum: 1, maximum: 100 },
  },
  required: [],
  additionalProperties: false,
}

const userCreatePayload: JSONSchemaType<User> = {
  type: "object",
  properties: {
    firstName: { type: "string" },
    lastName: { type: "string" },
    password: { type: "string", minLength: 8 },
    email: { type: "string", format: "email" },
  },
  required: ["firstName", "lastName", "password", "email"],
}

const idParamStrict = createStrict("id")
const hashQueryStrict = createStrict("hash")

const schemaDefinitions = {
  $id: schemaId("defs.json"),
  definitions: {
    idParamStrict,
    hashQueryStrict,
    pageQuery,
    userCreatePayload,
  },
}

export const schemaRef = <
  T extends keyof (typeof schemaDefinitions)["definitions"]
>(
  definition: T
) => {
  return {
    $id: schemaId("schema.json"),
    $ref: `defs.json#/definitions/${definition}`,
  }
}

export default function (
  fastify: FastifyInstance,
  options: never,
  done: Function
) {
  fastify.addSchema(schemaDefinitions)
  done()
}
