export interface AccessToken {
  token: string
  expire: Date
  userId: string
  isActive: boolean
  isAdmin: boolean
}
