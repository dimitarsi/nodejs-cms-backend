import controller, { withDefaultRoutes } from "../controller";
import auth from "../../middleware/auth";
import express from "express";
import stories from "../../repo/stories";
import ajv from "~/schema/core";
import { JSONSchemaType } from "ajv";

const app = express();

const validate = ajv.compile<
  JSONSchemaType<{
    configId: string
  }>
  >({
  $async: true,
  type: "object",
  properties: {
    configId: {
      type: "string",
      found: { in: "stories_config" },
    },
    name: {
      type: "string"
    },
    slug: {
      type: "string"
    }
  },
})


app.use(auth);

withDefaultRoutes(app, stories, {
  create: async (req) => validate(req.body).catch(err => err)
})

export default app;
