import { ObjectId } from "mongodb"
import crud from "./crud"
import {dbName as storiesDbName} from "./storyConfigs"

const withUpdateConfigId = (data: Record<string, any>) => {
  const {configId = '', ...splat} = data;
  const config = configId ? {configId: new ObjectId(configId)} : {};

  return {
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

const repo = crud("stories", { softDelete: false }, (crud, _collection) => {
  return {
    ...crud,
    create(data: Record<string, any>) {

      return crud.create({
        createOn: new Date(),
        updatedOn: new Date(),
        isActive: true,
        ...withUpdateConfigId(data)
      })
    },
    update(id: string, data: Record<string, any>) {
      return crud.update(id, {
        updatedOn: new Date(),
        ...withUpdateConfigId(data)
      })
    },
    async getById(id: string) {
      let query: any = { _id: -1 };
      try {
        query = { _id: new ObjectId(id) }; 
      } catch (_e) {
        query = {slug: id}
      }

      const cursor = await _collection.aggregate([
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
