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

export interface BaseContentData<D = any, C = ContentType> {
  name: string
  slug: string
  config: C
  children: BaseContentData[]
  outdated?: boolean
  data: D
}

export interface TopLevelContentData {
  isFolder: boolean
  folderLocation: string
  folderTarget: string
  configId?: ObjectId | string
  projectId: ObjectId | string
}

export type CreateContentPayload = TopLevelContentData &
  Omit<BaseContentData, "config">

export type ComputedContentFields = {
  folderDepth: number
}

export type UpdateContentPayload = CreateContentPayload & ComputedContentFields

export type Content = BaseModel & UpdateContentPayload

export type ContentWithConfig<T = ContentType> = Content & {
  config: T
}
