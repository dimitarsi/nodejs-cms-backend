import { JSONSchemaType } from "ajv";
import { User } from "~/models/user";
import ajv from "~/schema/core";

const notActive = {
  $or: [
    { isActive: { $exists: false } },
    { isActive: false },
    { isActive: null },
  ],
  // isActive: false
};

export const validateIsInactive = ajv.compile<JSONSchemaType<{ id: string }>>({
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

export const validateCreateUser = ajv.compile<JSONSchemaType<User>>({
  $async: true,
  type: "object",
  properties: {
    firstName: {
      type: "string"
    },
    lastName: {
      type: "string",
    },
    password: {
      type: "string",
      minLength: 8
    },
    email: {
      type: "string",
      format: "email",
      found: {in: "users:email", notIn: true}
    },
    gender: {
      enum: ["f", "m", "other"]
    }
  },
  required: ["firstName", "lastName", "password", "email"],
  additionalProperties: false
})
