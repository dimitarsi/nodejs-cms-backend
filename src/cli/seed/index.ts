import { seedComponents } from "./contentTypes"
import seedUsers from "./users"


export default async () => {
  try {
    await seedUsers()
  } catch(e) {
    console.error("Failed to seed users")
  }
  
  try {
    await seedComponents()
    console.log("Components seeded successfuly")
  } catch(e) {
    console.error("Failed to seed components")
  }
}