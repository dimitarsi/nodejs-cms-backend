import { ContentType } from "~/models/contentType";
import makeRepo from "./crud";
import { WithId } from "mongodb";

const crud = makeRepo<ContentType>("contentTypes", { softDelete: true })

export default {
  ...crud,
  async getById(idOrSlug: string) {
    const config = (await crud.getById(idOrSlug)) as WithId<ContentType>
    return config
  },
  async update(idOrSlug: string, data: ContentType) {
    if (data.type !== "composite" && data.children?.length) {
      data.type = "composite"
      data.children = [{
        name: data.name,
        slug: data.slug,
        type: data.type,
      },
      ...data.children]
    }

    const { _id, ...updated } = data;

    return await crud.update(idOrSlug, updated as any);
  }
}
