interface Row {
  label: string
  displayName: string
  width: number | string
  type: "custom" | "number" | "text" | "boolean"
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

interface Field {
  groupName: string
  rows: Row[]
}

export interface StoryConfigData {
  fields: Field[]
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
