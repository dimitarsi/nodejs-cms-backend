export function shouldUpdateFirstAndLastName(
  data: Record<string, string>
): data is { firstName: string; lastName: string } {
  return Boolean(data["firstName"] || data["lastName"])
}

export function shouldUpdatePassword(
  data: Record<string, string>
): data is { password: string; confirmPassword: string } {
  return Boolean(
    data["password"] &&
      data["confirmPassword"] &&
      data["password"].length > 8 &&
      data["password"] === data["confirmPassword"]
  )
}
