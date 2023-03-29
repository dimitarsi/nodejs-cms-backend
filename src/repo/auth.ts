import db from '../connect/db';
import { User } from '../models/user';
import bcrypt from "bcrypt";


export const getUserByEmail = async (email: string) => {
  return await db.collection<User>("users").findOne({
    email,
    password: { $exists: true },
  });
}

export const authenticate = async (email: string, password: string) => {
  const user = await getUserByEmail(email)
  let isLoggedIn = false

  if(user) {
    isLoggedIn = bcrypt.compareSync(password, user.password)
  }

  return {
    isLoggedIn,
    userId: user?._id.toString()
  }
}