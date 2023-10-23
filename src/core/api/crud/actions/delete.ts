import { CrudRepo } from "@repo/crud"
import { Controller } from "./types"

export async function deleteAction<R extends CrudRepo>(this: Controller<R>) {
  const { repo, id } = this
  const resp = id ? await repo.deleteById(id) : null

  if (!resp) {
    return null
  }

  if (resp.type === "softDelete") {
    return { deleted: resp.result.matchedCount > 0 }
  }

  return { delete: resp.result.deletedCount > 0 }
}
