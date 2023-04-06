export interface User {
  firstName: string
  lastName: string
  email: string
  password: string
}

export interface UserWithPermissions extends User {
  isActive: boolean
  isAdmin: boolean
}
