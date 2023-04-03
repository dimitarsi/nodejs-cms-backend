import { Validator, withDefaultRoutes } from "@api/controller"
import auth from "~/middleware/auth";
import express from "express";
import "./schema";
import crud, { defaultExtend } from "~/repo/crud";
import validate from "./schema";

const app = express();
const repo = crud("storiesConfig", { softDelete: true }, defaultExtend)

app.use(auth);


const validateCreate: Validator = async (req: express.Request) => {
  const valid = await validate(req.body)
  if (!valid) {
    return validate.errors
  }

  return null
} 

withDefaultRoutes(app, repo, {
  create: validateCreate,
})

export default app;
