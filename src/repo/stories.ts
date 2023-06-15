import { ObjectId } from "mongodb"
import crud from "./crud"
import {dbName as storiesDbName} from "./storyConfigs"

const withUpdateConfigId = (data: Record<string, any>) => {
  const {configId = '', folder, ...splat} = data;
  const config = configId ? {configId: new ObjectId(configId)} : {};

  return {
    folder,
    depth: folder.replace().split('/').length - 1 || 1,
    ...config,
    ...splat
  }
}

const unwrapConfigField = (data: Record<string, any>) => {
  const {config, ...splat} = data;
  if(config && Array.isArray(config) && config.length >= 1) {
    return {config: config[0], ...splat};
  }

  return {config, ...splat};
}

const notDeleted = { softDelete: false }
// TODO: pass softDelete query from `crud`
const softDelete = {}

const repo = crud("stories", notDeleted, (crud, collection) => {
  return {
    ...crud,
    create(data: Record<string, any>) {
      const normalized = withUpdateConfigId(data)
      return crud.create({
        createOn: new Date(),
        updatedOn: new Date(),
        isActive: true,
        ...normalized
      })
    },
    update(id: string, data: Record<string, any>) {
      return crud.update(id, {
        updatedOn: new Date(),
        ...withUpdateConfigId(data)
      })
    },
    async getAll(page = 1, options: {pageSize: number, filter: Record<string, any> } = {pageSize:20, filter: {}} ) {
      
      const filter = {
        ...softDelete,
        ...(options.filter || {})
      }
      
      const cursor = await collection.find(filter, {
        skip: options.pageSize * (page - 1),
        limit: options.pageSize,
      })

      const [items, count] = await Promise.all([
        cursor.toArray(),
        collection.countDocuments(filter),
      ])
      cursor.close()

      const totalPages = Math.ceil(count / options.pageSize)
      
      return {
        items,
        pagination: {
          page,
          perPage: options.pageSize,
          count,
          totalPage: totalPages,
          nextPage: page >= totalPages ? null : page + 1,
        },
      }
    },
    async getById(id: string) {
      let query: any = { _id: -1 };
      try {
        query = { _id: new ObjectId(id) }; 
      } catch (_e) {
        query = {slug: id}
      }

      const cursor = await collection.aggregate([
        {
          $match: {
            ...query
          }
        },
        {
          $lookup: {
            from: storiesDbName,
            localField: "configId",
            foreignField: "_id",
            as: "config"
          }
        }
      ])

      const data = await cursor.toArray();
      cursor.close()

      return data.map(unwrapConfigField)[0];

    }
  }
})

export default repo
