import { ContentType, freezeAllChildren } from "~/models/contentType"
import makeRepo from "./crud"
import { ObjectId, OptionalId } from "mongodb"

const crud = makeRepo<ContentType>("contentTypes", { softDelete: true })

async function getById(idOrSlug: ObjectId | string) {
  const waitList: Array<Promise<any>> = []
  let entity: ContentType | null = null

  try {
    entity = await crud.getById(idOrSlug)
    if (!entity) {
      throw new Error(`Enitity not found - ${idOrSlug}`)
    }
  } catch (e) {
    return null
  }

  entity.children?.forEach((entityChild, ind) => {
    if (entityChild.type === "root") {
      waitList.push(
        getById(entityChild._id!.toString()).then((result) => {
          if (!result || entity?.children) {
            return
          }

          const { name: originalName, slug: originalSlug, ...data } = result
          const { name, slug } = entity!.children![ind]

          freezeAllChildren(data)

          // @ts-ignore
          entity.children[ind] = {
            name,
            slug,
            originalName,
            originalSlug,
            freezed: true,
            ...data,
          }
        })
      )
    }
  })

  await Promise.all(waitList)

  return {
    ...entity,
    children: entity.children || [],
  }
}

export default {
  ...crud,
  getById,
  async create({ type: _type, ...data }: OptionalId<ContentType>) {
    return crud.create({
      type: "root",
      ...data,
    })
  },
  async update(idOrSlug: string, data: ContentType) {
    const { _id, ...updated } = data
    return await crud.update(idOrSlug, updated)
  },
}
