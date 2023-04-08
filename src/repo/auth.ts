import db from "@db"
import { UserWithPermissions } from "~/models/user"
import bcrypt from "bcrypt"

export const getUserByEmail = async (email: string) => {
  return await db.collection<UserWithPermissions>("users").findOne({
    email,
    password: { $exists: true },
    isActive: true
  })
}

export const authenticate = async (email: string, password: string) => {
  const user = await getUserByEmail(email)
  let isLoggedIn = false

  if (user) {
    isLoggedIn = bcrypt.compareSync(password, user.password)
  }

  return {
    isLoggedIn,
    isAdmin: user?.isAdmin,
    userId: user?._id.toString(),
  }
}
