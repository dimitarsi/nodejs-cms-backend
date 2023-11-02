import { FastifyInstance } from "fastify"
import { getAllUsers } from "./actions/getAll"
import createUser from "./actions/createUsers"
import deleteUser from "./actions/deleteUser"
import updateUser from "./actions/updateUser"
import auth from "@middleware/auth"
import activateUser from "./actions/activateUser"

export default function (
  instance: FastifyInstance,
  options: never,
  done: Function
) {
  activateUser(instance)

  instance.register((instance, options, done) => {
    auth(instance, { isAdmin: true }, () => {})

    getAllUsers(instance)

    createUser(instance)

    deleteUser(instance)

    updateUser(instance)

    done()
  })

  done()
}
