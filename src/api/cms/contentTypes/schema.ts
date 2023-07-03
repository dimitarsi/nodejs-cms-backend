import { JSONSchemaType } from "ajv"
import { ContentType } from "~/models/contentType"
import ajv from "~/schema/core"

// const featureRefUrl = "http://plenty-cms/schemas/defs.json"

// const featureDef = {
//   $id: featureRefUrl,
//   definitions: {
//     feature: {
//       type: "object",
//       properties: {
//         enabled: {
//           type: "boolean",
//         },
//       },
//     },
//   },
// }

// ajv.addSchema(featureDef)

ajv.addSchema({
  type: "object",
  $id: "/schemas/defs.json",
  definitions: {
    // defs.json#/definitions/component
    component: {
      type: "object",
      properties: {
        groupName: {
          type: "string",
        },
        rows: {
          type: "array",
          minItems: 0,
          items: {
            type: "object",
            properties: {
              label: {
                type: "string",
              },
              displayName: {
                type: "string",
              },
              type: {
                enum: ["custom", "text", "number", "boolean"],
              },
              width: {
                type: ["string", "number"],
              },
              source: {},
            },
          },
        },
      },
    },
  },
})

const validate = ajv.compile<JSONSchemaType<ContentType>>({
  type: "object",
  $id: "/schemas/content.json",
  $async: true,
  properties: {
    fields: {
      type: "array",
      minItems: 0,
      items: {
        $ref: "defs.json#/definitions/component"
      },
    },
    name: {
      type: "string",
    },
    slug: {
      type: "string",
      found: { notIn: true, in: "storiesConfig:slug" },
    },
    tags: {},
    features: {}
  },
  // optionalProperties: {
    // tags: {},
    // features: {
    //   type: ["object"],
    //   properties: {
    //     likes: {
    //       $ref: `${featureRefUrl}#/definitions/feature`,
    //     },
    //     comments: {
    //       $ref: `${featureRefUrl}#/definitions/feature`,
    //     },
    //     rating: {
    //       $ref: `${featureRefUrl}#/definitions/feature`,
    //     },
    //   },
    // },
  // },
  required: ["fields", "slug", "name"],
  additionalProperties: false,
})

export default validate
