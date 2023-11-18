import { loginSession } from "@config"

export const getSessionExpirationDate = () => {
  return new Date(Date.now() + loginSession)
}

export const getActivationExpirationDate = () => {
  return new Date(Date.now() + loginSession)
}
