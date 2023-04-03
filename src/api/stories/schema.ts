import { AnySchema, JSONSchemaType } from "ajv";
import ajv from "../../schema/core";

interface Row {
  label: string;
  displayName: string;
  width: number | string;
  type: "custom" | "number" | "text" | "boolean";
  source?:
    | {
        type: "list";
        options: string[];
      }
    | {
        type: "datasource";
        dataSourceId: string;
      }
    | {
        type: "remote";
        url: string;
      };
}

interface Field {
  groupName: string;
  rows: Row[];
}

interface StoryConfigData {
  fields: Field[];
  name: string;
  tags?: string[];
  features?: {
    likes: {
      enabled: boolean;
    };
    comments: {
      enabled: boolean;
    };
    rating: {
      enabled: boolean;
    };
  };
}

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
            row: {
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
  },
})

export default validate;
