import { BaseContentData, Content } from "~/models/content"
import { type ContentType } from "~/models/contentType"

export const generateFromConfig = (config: ContentType): BaseContentData => {
  const data = getValueByType(config)

  return {
    name: config.name,
    slug: config.slug,
    config: { ...config, children: [] },
    children: config.children?.length
      ? config.children.map(generateFromConfig)
      : [],
    data: config.repeated ? [data] : data,
  }
}

export const validateContentWithConfig = (
  data: Omit<BaseContentData<any, Omit<ContentType, "projectId">>, "projectId">,
  config: Omit<ContentType, "projectId">
): Omit<BaseContentData<Omit<ContentType, "projectId">>, "projectId"> => {
  let outdated = false

  const isSameSlug = data.config.slug === config.slug
  const isSameType = data.config.type === config.type

  if (!isSameSlug || !isSameType || !isSameRepeated(data.config, config)) {
    outdated = true
  }

  const { children, hasDifferentKeys } = mergeChildren(
    data.children,
    config.children
  )

  if (hasDifferentKeys) {
    outdated = hasDifferentKeys
  }

  // @ts-ignore
  return {
    ...data,
    outdated,
    children: children.map((ch, index) =>
      validateContentWithConfig(ch, config.children[index])
    ),
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

export const isSameRepeated = (
  configA: Pick<ContentType, "repeated"> | undefined,
  configB: Pick<ContentType, "repeated"> | undefined
) => {
  if (!configA?.repeated && !configB?.repeated) {
    return true
  }

  return (
    configA?.repeated?.max === configB?.repeated?.max &&
    configA?.repeated?.min === configB?.repeated?.min
  )
}

export const mergeChildren = (
  dataChildren: Array<Pick<BaseContentData, "slug">>, // BaseContentData["children"],
  configChildren: Array<Pick<ContentType, "slug">> // ContentType['children']
): { children: BaseContentData["children"]; hasDifferentKeys: boolean } => {
  const dataChildrenBySlug = keyBy(dataChildren, "slug")
  const configChildrenBySlug = keyBy(configChildren, "slug")

  const diffKeys = diff(
    Object.keys(dataChildrenBySlug),
    Object.keys(configChildrenBySlug)
  )

  return {
    children: Object.values({
      ...configChildrenBySlug,
      ...dataChildrenBySlug,
    }),
    hasDifferentKeys: !!diffKeys.length,
  }
}

export const keyBy = <D extends Record<string, any>, K extends keyof D>(
  data: D[],
  key: K
) => {
  return (data || []).reduce((acc, elem) => {
    return {
      ...acc,
      [elem[key]]: elem,
    }
  }, {})
}

export const diff = (keysA: string[], keysB: string[]): string[] => {
  let missingKeys = []
  const allKeys = new Set([...keysA, ...keysB])

  for (const k of allKeys) {
    if (keysA.includes(k) && keysB.includes(k)) {
      continue
    }
    missingKeys.push(k)
  }

  return missingKeys
}

export const emptyDataOrNull = (data: any) => {
  if (typeof data === "number") {
    return false
  }

  return (
    !data ||
    Object.keys(data).filter((k) => k.startsWith("__") === false).length === 0
  )
}
