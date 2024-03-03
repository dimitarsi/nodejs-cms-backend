import { ObjectId } from "mongodb"
import { ensureObjectId } from "~/helpers/objectid"
import slugify from "~/helpers/slugify"

export interface CreateContentType {
  name: string
  slug: string
  type:
    | "root"
    | "composite"
    | "text"
    | "media"
    | "toggle"
    | "date"
    | "rich-text"
    | "number"
    | "reference"
  repeated: null | { min?: number; max?: number }
  children: ContentType[]
  defaultValue: any
  projectId: ObjectId | string
}

export interface ContentType extends CreateContentType {
  _id?: ObjectId
  /**
   * Flag the ContentType as freezed, meaning should not be allowed to change.
   * This is enforced only on the client, as a measure when referencing other "root"
   * ContentTypes.
   */
  freezed?: boolean
  originalName?: string
  originalSlug?: string
}

type ContentTypesWithoutChildren = Exclude<
  ContentType["type"],
  "root" | "composite"
>

export const CT_TYPES: ContentTypesWithoutChildren[] = [
  "text",
  "media",
  "toggle",
  "date",
  "rich-text",
  "number",
  "reference",
]

export const createContentType = (
  name: string,
  projectId: ObjectId | string,
  type: ContentTypesWithoutChildren = "text",
  repeated: ContentType["repeated"] = null
): ContentType => ({
  name,
  slug: slugify(name),
  type,
  repeated,
  children: [],
  defaultValue: undefined,
  projectId: ensureObjectId(projectId),
})

export const freezeAllChildren = (
  contentType: Pick<ContentType, "children" | "freezed">
) => {
  contentType.freezed = true
  contentType.children?.forEach((c) => freezeAllChildren(c))
}

export const unfeezeAllChildren = (contentType: ContentType) => {
  contentType.freezed = true
  contentType.children.forEach((c) => unfeezeAllChildren(c))
}

/**
 * Helper method to easily compose contentTypes for tests and seeding
 */
export const compositeContentType = (
  name: string,
  projectId: ObjectId | string,
  isRoot = false
) => {
  const rootContentType: ContentType = {
    name,
    slug: slugify(name),
    type: isRoot ? "root" : "composite",
    children: [],
    freezed: false,
    repeated: null,
    defaultValue: undefined,
    projectId: ensureObjectId(projectId),
  }

  const chainable = {
    __rootContentType: rootContentType,
    add(contentType: ContentType) {
      if (rootContentType.freezed) {
        contentType.freezed = true
      }

      rootContentType.children!.push(contentType)
      return chainable
    },
    clone() {
      const cloned = compositeContentType(name, projectId, isRoot)
      // TODO: add a proper cloning
      cloned.__rootContentType.children = JSON.parse(
        JSON.stringify(rootContentType.children)
      )

      return cloned
    },
    /**
     * convenience method when setuping up tests
     */
    clearChildren() {
      rootContentType.children = []
    },
    getType() {
      return rootContentType
    },
    freeze() {
      freezeAllChildren(rootContentType)
      return chainable
    },
    unfreeze() {
      freezeAllChildren(rootContentType)
      return chainable
    },
  }

  return chainable
}
