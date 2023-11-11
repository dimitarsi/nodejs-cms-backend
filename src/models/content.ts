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

export interface CreateContentPayload {
  name: string
  slug: string
  type: "document" | "folder"
  folderLocation: string
  folderTarget: ""
  depth?: number
  id?: String
  configId?: string | ObjectId
  config?: ContentType
  data: object
}

export type Content = BaseModel & CreateContentPayload
