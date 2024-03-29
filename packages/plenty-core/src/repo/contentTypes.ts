import { ContentType, freezeAllChildren } from "~/models/contentType"
import makeRepo from "~/core/lib/crud"
import { Db, ObjectId, OptionalId } from "mongodb"
import { ensureObjectId } from "~/helpers/objectid"

export type ContentTypesRepo = ReturnType<typeof contentTypes>

export default function contentTypes(db: Db) {
  const crud = makeRepo<ContentType>(db.collection("contentTypes"), {
    softDelete: true,
  })

  async function getById(
    idOrSlug: ObjectId | string,
    projectId: ObjectId | string
  ) {
    const waitList: Array<Promise<any>> = []
    let entity: ContentType | null = null

    try {
      entity = await crud.getByIdForProject(idOrSlug, projectId)
      if (!entity) {
        throw new Error(`Enitity not found - ${idOrSlug}`)
      }
    } catch (e) {
      return null
    }

    entity.children?.forEach((entityChild, ind) => {
      if (entityChild.type === "root") {
        waitList.push(
          getById(entityChild._id!.toString(), projectId).then((result) => {
            if (!result) {
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

  return {
    ...crud,
    getById,
    async create({ type: _type, ...data }: OptionalId<ContentType>) {
      return crud.create({
        ...data,
        type: "root",
      })
    },
    async update(
      idOrSlug: string,
      projectId: ObjectId | string,
      data: ContentType
    ) {
      const { _id, ...updated } = data
      return await crud.updateForProject(
        idOrSlug,
        ensureObjectId(projectId),
        updated
      )
    },
  }
}
