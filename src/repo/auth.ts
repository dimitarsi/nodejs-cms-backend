import { UserWithPermissions } from "~/models/user"
import bcrypt from "bcrypt"
import { Db } from "mongodb"

// TODO: move to ~/cases
export default function auth(db: Db) {
  const getUserByEmail = async (email: string) => {
    return await db.collection<UserWithPermissions>("users").findOne({
      email,
      password: { $exists: true },
      isActive: true,
    })
  }

  const authenticate = async (email: string, password: string) => {
    const user = await getUserByEmail(email)
    let isLoggedIn = false

    if (user) {
      isLoggedIn = bcrypt.compareSync(password, user.password)
    }

    return {
      isLoggedIn,
      userId: user?._id.toString(),
    }
  }

  const deleteAll = async () => {
    return await db.collection("users").deleteMany({})
  }

  return {
    getUserByEmail,
    authenticate,
    deleteAll,
  }
}
