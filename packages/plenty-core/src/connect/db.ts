import { MongoClient } from "mongodb"

const mongoUrl =
  process.env.MONGO_URL || "mongodb://root:example@localhost:27017"

let maxPoolSize = parseInt(process.env.MONGO_MAX_POOL_SIZE || "5")

if (isNaN(maxPoolSize)) {
  maxPoolSize = 5
}

const client = new MongoClient(mongoUrl, {
  maxPoolSize,
})

export const closeMongoClient = () => client.close()
export const connectMongoClient = () => client.connect()

export default client
