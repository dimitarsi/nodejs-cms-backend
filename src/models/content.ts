import { ObjectId } from "mongodb";
import { BaseModel } from "./modal";

type FileId = string;
type RefId = string;

export type TextDataType = {
  type: "text",
  value: string
}

export type FileDataType = {
  type: "files",
  value: FileId
}

export type RefDataType = {
  type: "ref",
  value: {
    refId: RefId,
    type: string
  }
}

export type ComponentDataType = {
  type: "component",
  value: {
    componentId: string | ObjectId
  }
}

export type DataTypes = TextDataType | FileDataType | RefDataType | ComponentDataType

export interface Content extends BaseModel {
  displayName: string
  configId: string | ObjectId;
  data: DataTypes
}