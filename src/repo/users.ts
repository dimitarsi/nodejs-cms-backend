import { UserWithPermissions as User } from "~/models/user"
import crud, { BaseRepoMethods } from "./crud"
import { ObjectId } from "mongodb"
import bcrypt from "bcrypt"
import { rounds } from "@config"

const usersRepo = crud("users", { softDelete: false }, (crud, _collection) => ({
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
    if (!data.password) {
      return crud.update(id, data)
    }

    return crud.update(id, {
      firstName: data.firstName,
      lastName: data.lastName,
      password: bcrypt.hashSync(data.password, rounds),
    })
  },
  activate: (id: string | number) => {
    _collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: { isActive: true },
      }
    )
  },
}))

export default usersRepo as BaseRepoMethods<User> & {
  activate: (id: string | number) => Promise<void>
}
