import {
  FastifyInstance,
  FastifyPluginCallback,
  FastifyReply,
  FastifyRequest,
} from "fastify"

export default async function swaggerPlugin(
  instance: FastifyInstance,
  options: never,
  done: Function
) {
  await instance.register(require("@fastify/swagger"), {
    swagger: {
      info: {
        title: "Test swagger",
        description: "Testing the Fastify swagger API",
        version: "0.1.0",
      },
      externalDocs: {
        url: "https://swagger.io",
        description: "Find more info here",
      },
      host: "localhost",
      schemes: ["http"],
      consumes: ["application/json"],
      produces: ["application/json"],
      tags: [
        { name: "user", description: "User related end-points" },
        { name: "code", description: "Code related end-points" },
      ],
      definitions: {
        User: {
          type: "object",
          required: ["id", "email"],
          properties: {
            id: { type: "string", format: "uuid" },
            firstName: { type: "string" },
            lastName: { type: "string" },
            email: { type: "string", format: "email" },
          },
        },
      },
      securityDefinitions: {
        apiKey: {
          type: "apiKey",
          name: "apiKey",
          in: "header",
        },
      },
    },
  })

  await instance.register(require("@fastify/swagger-ui"), {
    routePrefix: "/documentation",
    uiConfig: {
      docExpansion: "full",
      deepLinking: false,
    },
    uiHooks: {
      onRequest: function (request, reply, next) {
        next()
      } as FastifyPluginCallback,
      preHandler: function (request, reply, next) {
        next()
      } as FastifyPluginCallback,
    },
    staticCSP: true,
    transformStaticCSP: (header: FastifyRequest["headers"]) => header,
    transformSpecification: (
      swaggerObject: any,
      request: FastifyRequest,
      reply: FastifyReply
    ) => {
      return swaggerObject
    },
    transformSpecificationClone: true,
  })

  done()
}
