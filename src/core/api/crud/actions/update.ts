import { Controller } from "./types"

export function update(this: Controller) {
  const { repo, id } = this
  const { _id, ...body } = this.body

  return repo.update(id, body)
}
