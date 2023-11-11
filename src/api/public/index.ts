import auth from "./auth"
import { FastifyInstance } from "fastify"

export default function publicApi(
  instance: FastifyInstance,
  options: never,
  done: Function
) {
  instance.register(auth)
  done()
}
