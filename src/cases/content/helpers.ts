import { type ContentType } from "~/models/contentType"

export const generateFromConfig = (config: ContentType) => {
  if (config.children.length) {
    const children: any = config.children.map(generateFromConfig)

    return {
      type: config.type,
      name: config.name,
      slug: config.slug,
      repeated: config.repeated,
      children: config.repeated ? [children] : children,
    }
  }

  const value = getValueByType(config)

  return {
    type: config.type,
    name: config.name,
    slug: config.slug,
    repeated: config.repeated,
    value: config.repeated ? [value] : value,
  }
}

export const getValueByType = (config: ContentType) => {
  switch (config.type) {
    case "number":
      return config.defaultValue || 0
    case "date":
      return config.defaultValue || new Date()
    case "toggle":
      return config.defaultValue || false
    case "media":
    case "composite":
    case "reference":
      return null
    case "root":
    case "rich-text":
    case "text":
    default:
      return config.defaultValue || ""
  }
}
