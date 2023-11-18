import { FastifyInstance, RouteShorthandOptions } from "fastify"

const opts: RouteShorthandOptions = {
  schema: {
    body: {
      type: "object",
      properties: {
        email: { type: "string" },
        password: { type: "string" },
      },
    },
  },
}

const logoutOptions: RouteShorthandOptions = {
  schema: {
    body: {
      type: "object",
      properties: {
        accessToken: { type: "string" },
      },
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
    const { userId, isLoggedIn, isAdmin } = await instance.auth.authenticate(
      body.email,
      body.password
    )

    if (isLoggedIn && userId) {
      const accessToken = await instance.accessToken.findOrCreateAccessToken(
        userId,
        {
          isAdmin,
        }
      )

      res.code(200).send({
        accessToken,
      })
    } else {
      res.code(401).send({
        error: "Unrecognized user",
      })
    }
  })

  instance.post<{
    Body: { accessToken: string }
  }>("/logout", logoutOptions, async function logout(req, res) {
    const { accessToken } = req.body

    const success = await instance.accessToken.deactivateToken(accessToken)

    if (success) {
      res.code(200).send({
        success: true,
      })
    } else {
      res.code(400).send({
        success: false,
      })
    }
  })

  done()
}
