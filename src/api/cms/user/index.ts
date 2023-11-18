import { FastifyInstance } from "fastify"
import { getAllUsers } from "./actions/getAll"
import createUser from "./actions/create"
import deleteUser from "./actions/delete"
import updateUser from "./actions/update"
import auth from "@middleware/auth"
import activateUser from "./actions/activateUser"
import getById from "./actions/getById"

export default function (
  instance: FastifyInstance,
  options: never,
  done: Function
) {
  activateUser(instance)

  instance.register((instance, options, done) => {
    auth(instance, { isAdmin: true })

    getAllUsers(instance)
    getById(instance)

    createUser(instance)

    deleteUser(instance)

    updateUser(instance)

    done()
  })

  done()
}
