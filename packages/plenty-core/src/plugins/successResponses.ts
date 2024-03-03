import { FastifyInstance, FastifyReply } from "fastify"

export default function successResponses(
  instance: FastifyInstance,
  _options: never,
  done: Function
) {
  instance.decorateReply("success", function success(this: FastifyReply) {
    return this.code(200).send({ success: true })
  })

  done()
}

declare module "fastify" {
  interface FastifyReply {
    success: () => FastifyReply
  }
}
