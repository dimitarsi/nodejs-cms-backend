export interface Component {
  groupName: string
  rows: Field[]
}

export interface BaseField {
  type: any
  label: string
  displayName: string
  width?: number | string
}

export type Field = RefField | NumField | TextField | BooleanField | ComponentField | DateField | FileField

export type RefField = BaseField & {
  type: "ref"
  data: {
    refId: number | string
  }
}

export type NumField = BaseField & {
  type: "number",
  data: null
}

export type TextField = BaseField & {
  type: "text",
  data: null
}

export type BooleanField = BaseField & {
  type: "boolean",
  data: null
}

export type ComponentField = BaseField & {
  type: "component",
  data: {
    componentId: number | string
  }
}

export type DateField = BaseField & {
  type: "date",
  data: null
}

export type FileField = BaseField & {
  type: "file",
  // TODO: Add exact data type
  data: any
}

//   type: "ref" | "number" | "text" | "boolean" | "component" | "date" | "file"
//   data: Record<string, any> | null,
//   source?:
//     | {
//         type: "list"
//         options: string[]
//       }
//     | {
//         type: "datasource"
//         dataSourceId: string
//       }
//     | {
//         type: "remote"
//         url: string
//       }
// }