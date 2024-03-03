import { loginSession, activationTime } from "@config"

export const getSessionExpirationDate = () => {
  return new Date(Date.now() + loginSession)
}

export const getActivationExpirationDate = () => {
  return new Date(Date.now() + loginSession)
}

export const getInvitationExpirationDate = () => {
  return new Date(Date.now() + activationTime)
}
