import { MongoClient } from "mongodb"

import accessToken from "~/repo/accessTokens"
;(async () => {
  const conn = new MongoClient("mongodb://root:example@localhost:27017")
  const db = await conn.db(process.env.DB_NAME)

  const repo = accessToken(db)
  await repo.deleteAll()

  await repo.findOrCreateAccessToken(
    "1",
    {
      isAdmin: true,
    },
    process.env.TEST_ACCESS_TOKEN
  )

  await conn.close()
})()
