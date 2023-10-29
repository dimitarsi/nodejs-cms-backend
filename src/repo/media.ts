import { Db, ObjectId } from "mongodb"
import { MediaDocument } from "~/models/media"

const collectionName = "files"

export default function media(db: Db) {
  const insertMany = async (data: MediaDocument[]) => {
    const resp = await db.collection(collectionName).insertMany(data)

    return resp
  }

  const getPath = async (fileId: string) => {
    const res = await db.collection(collectionName).findOne<MediaDocument>({
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
    return await db.collection(collectionName).findOneAndDelete({
      _id: new ObjectId(id),
    })
  }

  // TODO: remove the files as well, in the controller
  const deleteAll = async () => {
    return await db.collection(collectionName).deleteMany({})
  }

  return {
    insertMany,
    getPath,
    updateMedia,
    deleteById,
    deleteAll,
  }
}

declare module "fastify" {
  interface FastifyInstance {
    media: ReturnType<typeof media>
  }
}
