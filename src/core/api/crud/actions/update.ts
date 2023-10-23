import { CrudRepo } from "@repo/crud"
import { Controller } from "./types"

export function update<R extends CrudRepo>(this: Controller<R>) {
  const { repo, id } = this
  const { _id, ...body } = this.body

  return id ? repo.update(id, body) : null
}
