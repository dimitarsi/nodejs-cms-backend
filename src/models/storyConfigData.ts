interface Field {
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

interface Groups {
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
