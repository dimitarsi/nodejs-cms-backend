import { ContentType, freezeAllChildren } from "~/models/contentType";
import makeRepo from "./crud";
import { OptionalId, WithId } from "mongodb";

const crud = makeRepo<ContentType>("contentTypes", { softDelete: true })

async function getById(idOrSlug: string) {
  const entity = (await crud.getById(idOrSlug)) as WithId<ContentType>

  const waitList: Array<Promise<any>> = [];

  entity.children?.forEach((entityChild, ind) => {
    if (entityChild.type === "root") {
      waitList.push(getById(entityChild._id!.toString()).then(({ name: originalName, slug: originalSlug, ...data }) => {
        const { name, slug } = entity.children![ind];
        
        freezeAllChildren(data)

        entity.children![ind] = {
          name,
          slug,
          originalName,
          originalSlug,
          freezed: true,
          ...data
        }
      }))
    }
  })

  await Promise.all(waitList)

  return entity
};

export default {
  ...crud,
  getById,
  async create({type: _type, ...data}: OptionalId<ContentType>) {
    return crud.create({
      type: "root",
      ...data
    });
  },
  async update(idOrSlug: string, data: ContentType) {
    const { _id, ...updated } = data
    return await crud.update(idOrSlug, updated)
  },
}
