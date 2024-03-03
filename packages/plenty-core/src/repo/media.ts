import { Db, ObjectId } from "mongodb"
import crud from "~/core/lib/crud"
import { MediaDocument } from "~/models/media"

const collectionName = "files"

export default function media(db: Db) {
  const collection = db.collection(collectionName)

  const insertMany = async (data: MediaDocument[]) => {
    const resp = await collection.insertMany(data)

    return resp
  }

  const mediaCrud = crud(collection)

  const getPath = async (fileId: string) => {
    const res = await collection.findOne<MediaDocument>({
      fileId: fileId,
    })

    if (res) {
      return {
        path: res.absolutePath,
        filetype: res.mimetype,
      }
    }

    return {
      path: null,
      filetype: null,
    }
  }

  const updateMedia = async (id: string, data: Record<string, string>) => {
    await db.collection(collectionName).findOneAndUpdate(
      {
        _id: new ObjectId(id),
      },
      {
        $set: {
          name: data.name,
          author: data.author,
          tags: data.tags,
          location: data.location,
          description: data.description,
          seoAlt: data.seoAlt,
        },
      }
    )
  }

  // TODO: remove the file as well, in the controller
  const deleteById = async (id: string) => {
    return await collection.findOneAndDelete({
      _id: new ObjectId(id),
    })
  }

  // TODO: remove the files as well, in the controller
  const deleteAll = async () => {
    return await collection.deleteMany({})
  }

  return {
    getAll: (page = 1, pageSize = 20, projection?: Document | undefined) => {
      return mediaCrud.getAll(page, pageSize, {
        ...projection,
        absolutePath: 0,
        path: 0,
        location: 0,
      })
    },
    searchAll: mediaCrud.searchAll,
    insertMany,
    getPath,
    updateMedia,
    deleteById,
    deleteAll,
  }
}
