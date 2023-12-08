import { ObjectId } from "mongodb"
import { BaseModel } from "./modal"
import { ContentType } from "./contentType"

type FileId = string
type RefId = string

export type TextDataType = {
  type: "text"
  value: string
}

export type FileDataType = {
  type: "files"
  value: FileId
}

export type RefDataType = {
  type: "ref"
  value: {
    refId: RefId
    type: string
  }
}

export type ComponentDataType = {
  type: "component"
  componentId: string | ObjectId
  value: Record<string, DataTypes>
}

export type DataTypes =
  | TextDataType
  | FileDataType
  | RefDataType
  | ComponentDataType

export interface BaseContentData<D = any> {
  name: string
  slug: string
  // type: ContentType["type"]
  // repeated: ContentType["repeated"]
  config?: ContentType
  children: BaseContentData[]
  outdated?: boolean
  data: D
}

export interface TopLevelContentData {
  isFolder: boolean
  folderLocation: string
  folderTarget: string
  configId?: string | ObjectId
}

export type CreateContentPayload = TopLevelContentData & BaseContentData

export type ComputedContentFields = { folderDepth: number }

export type Content = BaseModel & CreateContentPayload & ComputedContentFields
