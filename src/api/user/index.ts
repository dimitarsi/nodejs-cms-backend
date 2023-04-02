import { withDefaultRoutes } from "../controller";
import users from "../../repo/users";
import express from "express";
import validate from "./schema";

const app = express();

withDefaultRoutes(app, users);

app.post("/:id/activate", async (req, res) => {
  try {
    const valid = await validate(req.params);
    
    if (!valid) {
      res.statusCode = 405;
      res.json(validate.errors);
      return;
    }
  } catch (er) {
    res.statusCode = 500;
    res.json({
      error: er
    });
    return;
  }

  await users.activate(req.params.id);

  res.json({ success: true });
});

export default app;
