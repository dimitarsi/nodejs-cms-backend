export const rounds = parseInt(process.env.USER_PASSWORD_ROUNDS || "10")
export const loginSession = 30 * 60 * 1000 // 30min
export const activationTime = 2 * 60 * 60 * 1000 // 2 days
