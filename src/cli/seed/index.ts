import { seedComponents } from "./components"
import seedUsers from "./users"


export default async () => {
  try {
    await seedUsers()
  } catch(e) {
    console.error("Failed to seed users")
  }
  
  try {
    await seedComponents()
  } catch(e) {
    console.error("Failed to seed components")
  }
}