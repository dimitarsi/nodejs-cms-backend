import { Controller } from "./types"

export async function deleteAction(this: Controller) {
  const { repo, id } = this
  const resp = await repo.deleteById(id)

  return resp.deletedCount > 0 ? "deleted" : `${id} not found`
}
