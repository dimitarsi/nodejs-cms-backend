import { ObjectId } from "mongodb";
import repo from '@repo/content'
import slugify from "~/helpers/slugify";

export const createContent = async (configId: ObjectId | string | undefined, name?: string, data: any = null) => {
  if (!configId || !name) {
    return;
  }
  return await repo.create({
    name: name,
    slug: slugify(name),
    configId: configId,
    folderLocation: '/',
    data
  })
}
