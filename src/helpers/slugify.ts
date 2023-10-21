import { identity } from "./filter"

export default function slugify(val: string) {
  const withUnderscore = val
    .replace(/\s+/g, "_")
    .split(/([A-Z][a-z]+)/)
    .filter(identity)
    .join("_")
    .replace(/_+/g, "_")
    .toLowerCase()

  return encodeURIComponent(withUnderscore)
}
