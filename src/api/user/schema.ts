import { JSONSchemaType } from "ajv";
import ajv from "~/schema/core";

const notActive = {
  $or: [
    { isActive: { $exists: false } },
    { isActive: false },
    { isActive: null },
  ],
  // isActive: false
};

const validate = ajv.compile<JSONSchemaType<{ id: string }>>({
  type: "object",
  properties: {
    id: {
      type: "string",
      found: {
        in: "users",
        extra: notActive,
      },
    },
  },
  $async: true,
  required: ["id"],
});

export default validate