import { JSONSchemaType } from "ajv"

export default function createStrict<T>(...keys: string[]): JSONSchemaType<T> {
  return {
    type: "object",
    properties: keys.reduce((acc, key) => {
      return {
        ...acc,
        [key]: { type: "string" },
      }
    }, {}),
    required: [...keys],
    additionalProperties: true,
  }
}
