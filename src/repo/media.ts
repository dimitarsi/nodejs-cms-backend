import db from "@db";
import { ObjectId } from "mongodb";

const collectionName = 'files';


interface MediaDocument {
  path: string,
  mimetype: string,
  filetype: string,
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
    return {
      path: res.path,
      filetype: res.filetype
    }
  }

  return {
    path: null,
    filetype: null
  }
}

export const updateMedia = async (id: string, data: Record<string, string>) => {
  await db.collection(collectionName).findOneAndUpdate({
    _id: new ObjectId(id)
  }, {
    $set: {
      name: data.name,
      author: data.author,
      tags: data.tags,
      location: data.location,
      description: data.description,
      seoAlt: data.seoAlt
    }
  })
}

// TODO: remove the file as well, in the controller
export const deleteById = async (id: string) => {
  return await db.collection(collectionName).findOneAndDelete({
    _id: new ObjectId(id)
  })
}

// TODO: remove the files as well, in the controller
export const deleteAll = async () => {
  return await db.collection(collectionName).deleteMany({});
}

export default {
  insertMany,
  getPath,
  updateMedia,
  deleteById,
  deleteAll
}