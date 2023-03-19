import controller from "./controller"
import bcrypt from "bcrypt"
import {rounds} from "../config/config"

export interface User {
  firstName: string
  lastName: string
  email: string
  isActive: boolean
  isAdmin: boolean
  password: string
}

export default controller<User>('users', (crud, _collection) => ({
  ...crud,
  create: (data: Partial<User>) => {
    if(!data.password) {
      throw "Invalid password"
    }

    return crud.create({
      ...data,
      password: bcrypt.hashSync(data.password, rounds),
    });
  },
  update: (id: string | number, data: Partial<User>) => {
    if(!data.password) {
      return crud.update(id, data)
    }

    return crud.update(id, {
      ...data,
      password: bcrypt.hashSync(data.password, rounds),
    });
  }
}))