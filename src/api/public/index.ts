import auth from "./auth"
import media from "./media"
import { FastifyInstance } from "fastify"

export default function publicApi(
  instance: FastifyInstance,
  options: never,
  done: Function
) {
  instance.register(auth)
  instance.register(media)
  done()
}
