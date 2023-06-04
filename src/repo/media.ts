import db from "@db";
import { ObjectId } from "mongodb";

const collectionName = 'files';


interface MediaDocument {
  path: string,
  mimetype: string,
  originalName: string,
  size: string
}

export const insertMany = async (data: MediaDocument[]) => {
  const resp = await db.collection(collectionName).insertMany(data)

  return resp;
}

export const getPath = async (id: string) => {
  const res = await db.collection(collectionName).findOne<MediaDocument>({
    _id: new ObjectId(id)
  })

  if(res) {
    return res.path
  }

  return null
}