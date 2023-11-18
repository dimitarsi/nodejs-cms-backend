import client from "@db"
import seed from "./seed"
import removeData from "./seed/remove"
import "~/config"

const dbName = process.env.DB_NAME || "plenty_cms"

;(async () => {
  const db = await client.db(dbName)

  if (process.argv.includes("--seed")) {
    seed(db).then(() => {
      console.log("Done")
      process.exit(0)
    })
  }

  if (process.argv.includes("--reseed")) {
    removeData(db)
      .then(() => seed(db))
      .then(() => {
        console.log("Done")
        process.exit(0)
      })
  }
})()
