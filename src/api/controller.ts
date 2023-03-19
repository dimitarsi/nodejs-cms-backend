import express from "express";
import crud from "../repo/crud";

type ExtendCrud = Parameters<typeof crud>[1]

export default <T>(collectionName: string, extend?: ExtendCrud) => {
  const app = express();
  const repo = crud(collectionName, extend);

  app.get("/", async (req, res) => {
    const page = parseInt(req.query["page"]?.toString() || "1");
    res.json(await repo.getAll(isNaN(page) ? 1 : page));
  });

  app.get("/:id", async (req, res) => {
    res.json(await repo.getById(req.params.id));
  });

  app.post("/", async (req, res) => {
    const result = await repo.create(req.body);

    res.json({
      id: result.insertedId,
    });
  });

  app.patch("/:id", async (req, res) => {
    const result = await repo.update(req.params.id, req.body);

    res.json({
      matched: result.matchedCount,
    });
  });

  app.delete("/:id", async (req, res) => {
    const resp = await repo.deleteById(req.params.id);

    res.json({
      status: resp.deletedCount > 0 ? "deleted" : `${req.params.id} not found`,
    });
  });

  return app;
};