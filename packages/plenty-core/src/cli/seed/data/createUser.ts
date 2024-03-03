const defaultPayload = {
  firstName: "Admin",
  lastName: "Root",
  isAdmin: true,
  isActive: true,
  email: "admin@gmail.com",
  password: "1234567890",
  projects: [],
}

export const createUserPayload = (email: string) => ({
  ...defaultPayload,
  email,
})

export default defaultPayload
