import { type CrudRepo } from "@repo/crud"
import { type Controller } from "./types"

export function getAll<R extends CrudRepo>(this: Controller<R>) {
  const page = this.getPage()

  return this.repo.getAll(page)
}
