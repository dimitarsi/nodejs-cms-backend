import {
  findOrCreateAccessToken,
  deactivateToken,
} from "~/repo/accessTokens"

import express from "express"
import { authenticate } from "~/repo/auth"
import db from "@db"

const app = express()

app.post("/login", async (req, res) => {
  const body = req.body
  const { userId, isLoggedIn, isAdmin } = await authenticate(body.email, body.password)

  if (isLoggedIn && userId) {
    const accessToken = await findOrCreateAccessToken(userId, {isAdmin})

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

app.post("/logout", async (req, res) => {
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

app.post("/logout-all", async (req, res) => {
  try {
    db.collection("accessTokens").deleteMany();
     res.json({
       success: true,
     })
  } catch (e) {
    res.status(400).json({success: false})
  }
})

export default app
