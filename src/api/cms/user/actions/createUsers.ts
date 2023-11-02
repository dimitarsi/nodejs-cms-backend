import { FastifyInstance, RouteShorthandOptions } from "fastify"
import { User } from "~/models/user"
import { schemaRef } from "~/schema/cms-api"

const createUserOptions: RouteShorthandOptions = {
  schema: {
    body: schemaRef("userCreatePayload"),
  },
}

export default function createUser(instance: FastifyInstance) {
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
}
