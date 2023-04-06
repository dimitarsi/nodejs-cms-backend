import { withDefaultRoutes } from "../controller";
import users from "~/repo/users";
import express from "express";
import { validateIsInactive, validateCreateUser } from "./schema"

const app = express();

withDefaultRoutes(app, users, {
  create: (req) =>  validateCreateUser(req.body)
      .then(_result => {
        return undefined
      })
      .catch(err => {
        return err.errors
    })
});

app.post("/:id/activate", async (req, res) => {
  try {
    const valid = await validateIsInactive(req.params)
    
    if (!valid) {
      res.statusCode = 405;
      res.json(validateIsInactive.errors)
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
