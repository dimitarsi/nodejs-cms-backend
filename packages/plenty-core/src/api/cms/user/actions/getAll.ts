import { FastifyInstance, RouteShorthandOptions } from "fastify"
import { schemaRef } from "~/schema/cmsAPISchema"

const getAllOptions: RouteShorthandOptions = {
  schema: {
    querystring: schemaRef("pageQuery"),
    // @ts-ignore
    tags: ["user"],
    description: "This is a description for the activate endpoint",
    response: {
      // "200": {},
    },
  },
}

/**
 * @deprecated - Users should not be able to list other users. Move this endpoint to `/project/:projectId/users` to see all users for a project
 */
export function getAllUsers(instance: FastifyInstance) {
  instance.get<{
    Querystring: { page: number; perPage: number }
  }>("/users", getAllOptions, async (req, reply) => {
    const users = await instance.users.getAll(req.query.page, req.query.perPage)

    reply.send(users)
  })
}
