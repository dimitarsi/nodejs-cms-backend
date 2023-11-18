import { JSONSchemaType } from "ajv"

export default function createStrict<T>(key: string): JSONSchemaType<T> {
  return {
    type: "object",
    properties: {
      [key]: { type: "string" },
    },
    required: [key],
    additionalProperties: true,
  }
}
