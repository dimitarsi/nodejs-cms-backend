import { Collection, ObjectId } from "mongodb";
import db from "../connect/db";

const baseCrudMethods = <T>(collection: Collection) => ({
  async getAll(page = 1, pageSize = 20) {
    const cursor = await collection.find(
      {},
      {
        skip: pageSize * (page - 1),
        limit: pageSize,
      }
    );

    const data = await cursor.toArray();
    cursor.close();

    return data;
  },
  async create(data: Partial<T>) {
    return await collection.insertOne(data);
  },
  async update(id: string | number, data: Partial<T>) {
    return await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: data }
    );
  },
  async deleteById(id: string | number) {
    return await collection.deleteOne({ _id: new ObjectId(id) });
  },
  async getById(id: string | number) {
    return await collection.findOne({ _id: new ObjectId(id) });
  },
});

export default <T extends Object>(
  collectionName: string,
  extend?: (
    crudMethods: ReturnType<typeof baseCrudMethods>,
    collection: Collection
  ) => Record<string, Function>
) => {
  const collection = db.collection(collectionName);

  const crudMethods = baseCrudMethods<T>(collection);
  return extend ? extend(crudMethods, collection) : crudMethods;
};
