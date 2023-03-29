import express, { Application } from "express";
import crud from "../repo/crud";

type ExtendCrud = Parameters<typeof crud>[1];

export const withDefaultRoutes = (
  app: Application,
  repo: Record<string, Function>
) => {
  const routes: Record<string, express.Handler> = {
    getAll: async (req, res) => {
      const page = parseInt(req.query["page"]?.toString() || "1");
      res.json(await repo.getAll(isNaN(page) ? 1 : page));
    },
    getById: async (req, res) => {
      res.json(await repo.getById(req.params.id));
    },
    create: async (req, res) => {
      const result = await repo.create(req.body);

      res.json({
        id: result.insertedId,
      });
    },
    update: async (req, res) => {
      const result = await repo.update(req.params.id, req.body);

      res.json({
        matched: result.matchedCount,
      });
    },
    delete: async (req, res) => {
      const resp = await repo.deleteById(req.params.id);

      res.json({
        status:
          resp.deletedCount > 0 ? "deleted" : `${req.params.id} not found`,
      });
    },
  };

  app.get("/", routes.getAll);
  app.get("/:id", routes.getById);
  app.post("/", routes.create);
  app.patch("/:id", routes.update);
  app.delete("/:id", routes.delete);

  return app;
};

export const scaffold = <T extends Object>(
  collectionName: string,
  extend?: ExtendCrud
) => {
  const repo = crud<T>(collectionName, extend);
  const app = express();

  return withDefaultRoutes(app, repo);
};

export default scaffold;
