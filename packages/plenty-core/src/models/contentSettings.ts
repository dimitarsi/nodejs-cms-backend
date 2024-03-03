import type { ObjectId } from "mongodb"

export default interface ContentSettings {
  _id: ObjectId | string
  contentId: ObjectId | string
  previewUrl: {
    slug: string
  }
}
