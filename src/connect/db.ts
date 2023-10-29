import { MongoClient } from "mongodb"

const mongoUrl =
  process.env.MONGO_URL || "mongodb://root:example@localhost:27017"

let maxPoolSize = parseInt(process.env.MONGO_MAX_POOL_SIZE || "5")

// const dbName = process.env.DB_NAME || "plenty_cms"

if (isNaN(maxPoolSize)) {
  maxPoolSize = 5
}

const client = new MongoClient(mongoUrl, {
  maxPoolSize,
})

export const closeMongoClient = () => client.close()
export const connectMongoClient = () => client.connect()

export default client

// export default client.db(dbName)
// import fastifyMongodb from "@fastify/mongodb"
// import { FastifyInstance } from "fastify"
// import fastifyPlugin from "fastify-plugin"

// async function dbConnector(fastify: FastifyInstance, options: never) {
//   // fastify.register(fastifyMongodb, {
//   //   url: mongoUrl,
//   //   name: dbName,
//   //   maxPoolSize: maxPoolSize,
//   // })

// }

// export default fastifyPlugin(dbConnector)
