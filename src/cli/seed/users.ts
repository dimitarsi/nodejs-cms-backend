import { validateCreateUser } from "@api/cms/user/schema"
import userRepo from "~/repo/users"
import ajv from "~/schema/core"

const validateEmailIsUnique = ajv.compile({
  type: "object",
  $async: true,
  properties: {
    email: {
      type: "string",
      format: "email",
      found: {in:"users:email", notIn: true}
    }
  }
})

export default async function seedUsers() {
  const data = [{
    firstName: 'Admin',
    lastName: 'Root',
    isAdmin: true,
    isActive: true,
    email: "admin@gmail.com",
    password: "1234567890"
  }]

  for(const userData of data) {
    const valid = await validateEmailIsUnique(userData)

    if (valid) {
      await userRepo.create(userData)    
    } else {
      console.error(validateCreateUser.errors)
    }
  }

}