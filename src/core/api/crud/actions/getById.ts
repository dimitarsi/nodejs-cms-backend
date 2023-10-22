import { Controller } from "./types"

export function getById(this: Controller) {
  const { repo, id } = this
  return repo.getById(id)

  // if (!data || Object.keys(data).length === 0) {
  //   res.status(404).json({ message: "Not Found" })
  // } else {
  //   res.json(data)
  // }
}
