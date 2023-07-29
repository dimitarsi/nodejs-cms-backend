import { ObjectId } from "mongodb"
import slugify from "~/helpers/slugify"

export interface ContentType {
  _id?: ObjectId
  name: string
  slug: string
  type: "root" | "composite" | string
  children?: ContentType[] | null 
}

export const textContentType = (name: string): ContentType => ({
  name,
  slug: slugify(name),
  type: "text",
  children: null
})

export const compositeContentType = (name: string, isRoot = false) => {

  const rootContentType: ContentType = {
    name,
    slug: slugify(name),
    type: isRoot ? "root" : "composite",
    children: []
  }

  const chainable = {
    __rootContentType: rootContentType,
    add(contentType: ContentType) {
      rootContentType.children!.push(contentType)
      return chainable
    },
    clone() {
      const cloned = compositeContentType(name, isRoot)
      // TODO: add a proper cloning
      cloned.__rootContentType.children = JSON.parse(JSON.stringify(rootContentType.children)) 

      return cloned;
    },
    clearChildren() {
      rootContentType.children = []
    },
    getType() {
      return rootContentType
    }
  }

  return chainable;
}