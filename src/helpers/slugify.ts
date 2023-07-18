import { identity } from "./filter";

export default function slugify(val: string) {
  const withUnderscore = val
    .replace(/\s+/, '_')
    .split(/([A-Z][a-z]+)/)
    .filter(identity)
    .join("_")
    .replace(/_+/, '_')
    .toLowerCase()
  
  return encodeURIComponent(withUnderscore);
} 