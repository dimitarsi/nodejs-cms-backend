import defaultController from "~/core/api/controller"
import users from "~/repo/users"
import express from "express"
import { validateIsInactive, validateCreateUser } from "./schema"
import { User } from "~/models/user"
import Router from "~/core/api/router"

const router = Router("/user")

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
  }
)

router.post("/:id/activate", async function activateUser(req, res) {
  try {
    const valid = await validateIsInactive(req.params)

    if (!valid) {
      res.statusCode = 405
      res.json(validateIsInactive.errors)
      return
    }
  } catch (er) {
    res.statusCode = 500
    res.json({
      error: er,
    })
    return
  }

  await users.activate(req.params.id)

  res.json({ success: true })
})

export default router
