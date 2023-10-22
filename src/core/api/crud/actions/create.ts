import { Controller } from "./types"

export function create(this: Controller) {
  const page = this.getPage()

  return this.repo.getAll(page)
}
