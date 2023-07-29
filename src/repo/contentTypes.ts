import { ContentType } from "~/models/contentType";
import makeRepo from "./crud";
import { WithId } from "mongodb";

const crud = makeRepo<ContentType>("contentTypes", { softDelete: true })

async function getById(idOrSlug: string) {
  const entity = (await crud.getById(idOrSlug)) as WithId<ContentType>

  const waitList: Array<Promise<any>> = [];

  entity.children?.forEach((entityChild, ind) => {
    if (entityChild.type === "root") {
      waitList.push(getById(entityChild._id!.toString()).then((data) => {
        entity.children![ind] = data;
      }))
    }
  })

  await Promise.all(waitList)

  return entity
};

export default {
  ...crud,
  getById,
  async update(idOrSlug: string, data: ContentType) {

    const { _id, ...updated } = data
    return await crud.update(idOrSlug, updated)
  },
}
