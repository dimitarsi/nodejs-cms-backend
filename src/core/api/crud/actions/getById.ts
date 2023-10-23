import { type CrudRepo } from "@repo/crud"
import { type Controller } from "./types"

export function getById<R extends CrudRepo>(this: Controller<R>) {
  const { repo, id } = this

  return id ? repo.getById(id) : null
}
