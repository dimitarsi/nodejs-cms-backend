import { JSONSchemaType } from "ajv";
import { StoryConfigData } from "~/models/storyConfigData";
import ajv from "~/schema/core";

const featureRefUrl = "http://plenty-cms/schemas/defs.json";

const featureDef = {
  $id: featureRefUrl,
  definitions: {
    feature: {
      type: "object",
      properties: {
        enabled: {
          type: "boolean",
        },
      },
    },
  },
};

ajv.addSchema(featureDef);

const validate = ajv.compile<JSONSchemaType<StoryConfigData>>({
  type: "object",
  $async: true,
  properties: {
    fields: {
      type: "array",
      minItems: 0,
      items:
      {
        type: "object",
        properties: {
          groupName: {
            type: "string",
          },
          rows: {
            type: "array",
            minItems: 0,
            items:
            {
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
                source: {
                  // anyOf: [
                  //   {
                  //     type: "object",
                  //     properties: {
                  //       type: {
                  //         type: "string"
                  //       },
                  //       options: {
                  //         type: {
                  //           type: "string"
                  //         },
                  //         items: {
                  //           type: "string"
                  //         }
                  //       }
                  //     }
                  //   },
                  // {
                  //   type: "object",
                  //   properties: {
                  //     type: {
                  //       type: "string"
                  //     },
                  //     dataSourceId: {
                  //       type: "string"
                  //     }
                  //   }
                  // },
                  // {
                  //   type: "object",
                  //   properties: {
                  //     type: {
                  //       type: "string"
                  //     },
                  //     url: {
                  //       type: "string",
                  //       format: "url"
                  //     }
                  //   }
                  // }
                  // ]
                },
              },
            },
          },
        },
      },
    },
    name: {
      type: "string",
    },
    tags: {},
    features: {
      type: "object",
      properties: {
        likes: {
          $ref: `${featureRefUrl}#/definitions/feature`,
        },
        comments: {
          $ref: `${featureRefUrl}#/definitions/feature`,
        },
        rating: {
          $ref: `${featureRefUrl}#/definitions/feature`,
        },
      },
    },
    slug: {
      type: "string",
      found: {notIn: true, in: "storiesConfig:slug"}
    }
  },
  required: ["fields", "slug", "name"],
  additionalProperties: false
})

export default validate;
