import { loginSession } from '../config/config';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import express from "express"
import db from "../connect/db"

const app = express()

interface User {
  firstName: string
  lastName: string
  email: string
  password: string
}
interface AccessToken {
  token: string
  expire: Date
  userId: string
  isActive: boolean
}

const findOrCreateAccessToken = async (userId: string) => {
  const activeToken = await db.collection<AccessToken>("accessTokens").findOne({
    userId,
    expire: {$gt: new Date()},
    isActive: true,
  });

  if(activeToken) {
    return activeToken.token
  }

  const accessToken = randomUUID();

  await db.collection<AccessToken>("accessTokens").insertOne({
    token: accessToken,
    expire: new Date(Date.now() + loginSession),
    userId,
    isActive: true,
  });

  return accessToken
}


app.post('/login', async (req, res) => {

  const {email, password} = req.body
  const user = await db.collection<User>('users').findOne({
    email,
    password: {$exists: true}
  })
  let isLoggedIn = false

  if(user) {
    isLoggedIn = bcrypt.compareSync(password, user.password)
  }

  if(user && isLoggedIn) {
    const accessToken = await findOrCreateAccessToken(user._id.toString())

    res.json({
      accessToken
    })
  } else {
    res.statusCode = 401
    res.json({
      error: 'Unrecognized user'
    })
  }

})

app.post('/logout', async (req, res) => {
  const {accessToken} = req.body

  const data = await db.collection<AccessToken>('accessTokens').updateOne({
    token: accessToken,
    expire: {$gt: new Date()},
    isActive: true
  }, {
    $set: {isActive: false}
  })

  if(data.modifiedCount > 0) {
    res.json({
      success: true
    })
  } else {
    res.statusCode = 400
    res.json({
      success: false
    })
  }
})

export default app