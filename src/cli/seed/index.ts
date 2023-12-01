import { Db } from "mongodb"
import { createContent } from "./content"
import { seedContentTypes } from "./contentTypes"
// import seedUsers from "./users"

export default async (db: Db) => {
  try {
    // await seedUsers()
  } catch (e) {
    console.error("Failed to seed users")
  }

  try {
    const finalContentType = await seedContentTypes(db)
    console.log("Content types seeded successfuly")

    for (let i = 0; i < 100; i++) {
      const configId = finalContentType?.insertedId
      if (configId) {
        await createContent(db)(
          configId,
          `Seed Post ${(i + 1).toString().padStart(2, "0")}`
        )

        console.log("New Content Added - " + (i + 1))
      }
    }
  } catch (e) {
    console.error("Failed to seed components")
  }
}
