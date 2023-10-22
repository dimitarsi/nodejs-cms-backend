import { Controller } from "./types"

export function getAll(this: Controller) {
  const page = this.getPage()

  return this.repo.getAll(page)
}
