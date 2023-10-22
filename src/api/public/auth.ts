import { findOrCreateAccessToken, deactivateToken } from "~/repo/accessTokens"

import Router from "~/core/api/router"
import { authenticate } from "~/repo/auth"
import db from "@db"

const router = Router()

router.post("/login", async function login(req, res) {
  const body = req.body
  const { userId, isLoggedIn, isAdmin } = await authenticate(
    body.email,
    body.password
  )

  if (isLoggedIn && userId) {
    const accessToken = await findOrCreateAccessToken(userId, { isAdmin })

    res.json({
      accessToken,
    })
  } else {
    res.statusCode = 401
    res.json({
      error: "Unrecognized user",
    })
  }
})

router.post("/logout", async function logout(req, res) {
  const { accessToken } = req.body

  const success = await deactivateToken(accessToken)

  if (success) {
    res.json({
      success: true,
    })
  } else {
    res.statusCode = 400
    res.json({
      success: false,
    })
  }
})

router.post("/logout-all", async function logoutAll(req, res) {
  try {
    db.collection("accessTokens").deleteMany()
    res.json({
      success: true,
    })
  } catch (e) {
    res.status(400).json({ success: false })
  }
})

export default router
