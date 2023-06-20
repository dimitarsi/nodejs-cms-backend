export interface Field {
  label: string
  displayName: string
  width: number | string
  type: "ref" | "number" | "text" | "boolean" | "component" | "date"
  data: Record<string, any>,
  source?:
    | {
        type: "list"
        options: string[]
      }
    | {
        type: "datasource"
        dataSourceId: string
      }
    | {
        type: "remote"
        url: string
      }
}

export interface Groups {
  groupName: string
  rows: Field[]
}

export interface StoryConfigData {
  fields: Groups[]
  name: string
  tags?: string[]
  features?: {
    likes: {
      enabled: boolean
    }
    comments: {
      enabled: boolean
    }
    rating: {
      enabled: boolean
    }
  }
}
