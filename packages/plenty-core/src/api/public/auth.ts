import { FastifyInstance, RouteShorthandOptions } from "fastify"

const opts: RouteShorthandOptions = {
  schema: {
    body: {
      type: "object",
      properties: {
        email: { type: "string", format: "email" },
        password: { type: "string", minLength: 8 },
      },
      required: ["email", "password"],
      additionalProperties: false,
    },
  },
}

const logoutOptions: RouteShorthandOptions = {
  schema: {
    body: {
      type: "object",
      properties: {
        accessToken: { type: "string", format: "uuid" },
      },
      required: ["accessToken"],
    },
  },
}

export default function auth(
  instance: FastifyInstance,
  options: never,
  done: Function
) {
  instance.post<{
    Body: { email: string; password: string }
  }>("/login", opts, async function login(req, res) {
    const body = req.body
    const { userId, isLoggedIn } = await instance.auth.authenticate(
      body.email,
      body.password
    )

    if (isLoggedIn && userId) {
      const accessToken = await instance.accessToken.findOrCreateAccessToken(
        userId
      )

      res.code(200).send({
        accessToken,
      })
    } else {
      res.unauthorized()
    }
  })

  instance.post<{
    Body: { accessToken: string }
  }>("/logout", logoutOptions, async function logout(req, res) {
    const { accessToken } = req.body

    const success = await instance.accessToken.deactivateToken(accessToken)

    if (!success) {
      return res.badRequest()
    }

    res.success()
  })

  done()
}
