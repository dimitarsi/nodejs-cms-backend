import { UserWithPermissions as User } from "~/models/user"
import makeRepo from "./crud"
import { ObjectId } from "mongodb"
import bcrypt from "bcrypt"
import { rounds } from "@config"

const crud = makeRepo<User>("users")
const collection = crud.getCollection()

export default {
  ...crud,
  create: (data: User) => {
    return crud.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      isActive: data.isActive,
      isAdmin: data.isAdmin,
      password: bcrypt.hashSync(data.password, rounds),
    })
  },
  update: (id: string | number, data: Partial<User>) => {
    // When updating the password, it needs to be encrypted
    if (!data.password) {
      return crud.update(id, data)
    }

    // Update only the password field
    return crud.update(id, {
      // firstName: data.firstName,
      // lastName: data.lastName,
      password: bcrypt.hashSync(data.password, rounds),
    })
  },
  activate: (id: string | number) => {
    collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: { isActive: true },
      }
    )
  },
}
