import { FastifyInstance } from "fastify"
import { JSONSchemaType } from "ajv"
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

const filtersAndPageQuery: JSONSchemaType<{ page: number; perPage: number }> = {
  type: "object",
  properties: {
    page: { type: "number", default: 1, minimum: 1 },
    perPage: { type: "number", default: 20, minimum: 1, maximum: 100 },
    folder: { type: "string" },
  },
  required: [],
  additionalProperties: false,
}

export const userCreatePayload: JSONSchemaType<User> = {
  type: "object",
  properties: {
    firstName: { type: "string" },
    lastName: { type: "string" },
    password: { type: "string", minLength: 8 },
    email: { type: "string", format: "email" },
    projects: { type: "array", items: { type: "string" } },
  },
  required: ["firstName", "lastName", "password", "email"],
}

// JSONSchemaType<Omit<CreateContentPayload, "id" | "config">>
export const contentCreatePayload = {
  type: "object",
  properties: {
    name: { type: "string" },
    slug: { type: "string" },
    isFolder: { type: "boolean" },
    folderLocation: { type: "string" },
    folderTarget: { type: "string" },
    folderDepth: { type: "number", nullable: true },
    configId: { type: "string", nullable: true },
    data: {
      type: "object",
      required: [],
      nullable: true,
      additionalProperties: true,
      properties: {},
    },
  },
  additionalProperties: false,
  required: ["name", "slug", "isFolder"],
}

export const contentUpdatePayload = {
  type: "object",
  properties: {
    name: { type: "string" },
    slug: { type: "string" },
    isFolder: { type: "boolean" },
    folderLocation: { type: "string" },
    folderTarget: { type: "string" },
    folderDepth: { type: "number", nullable: true },
    configId: { type: "string", nullable: true },
    children: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: true,
        properties: {},
        required: [],
      },
    },
    data: {
      type: "object",
      required: [],
      nullable: true,
      additionalProperties: true,
      properties: {},
    },
  },
  additionalProperties: false,
  required: [],
}

export const contentTypeCreatePayload = {
  type: "object",
  properties: {
    name: { type: "string" },
    slug: { type: "string" },
    type: { type: "string" },
    repeated: { type: "boolean" },
    children: {
      type: "array",
      minItems: 0,
      items: {
        $ref: "#",
      },
    },
    freezed: { type: "boolean" },
  },
  additionalProperties: false,
  required: ["name", "slug", "type", "repeated", "children"],
}

const idParamStrict = createStrict("id")
const idOrSlugParamStrict = createStrict("idOrSlug")
const idOrSlugAndProjectIdParamStrict = createStrict("idOrSlug", "projectId")
const projectIdParamStrict = createStrict("projectId")
const hashQueryStrict = createStrict("hash")

const schemaDefinitions = {
  $id: schemaId("defs.json"),
  definitions: {
    idParamStrict,
    hashQueryStrict,
    pageQuery,
    filtersAndPageQuery,
    userCreatePayload,
    idOrSlugParamStrict,
    contentCreatePayload,
    contentTypeCreatePayload,
    contentUpdatePayload,
    idOrSlugAndProjectIdParamStrict,
    projectIdParamStrict,
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
