import { Router } from "express";
import db from "../connect/db";

const router = Router();

router.use(async (req, res, next) => {
  let accessToken = "";
  let activeToken = null;

  if (req.method === "GET" || req.headers["x-accesstoken"]) {
    const accessTokenHeader = req.headers["x-accesstoken"];
    accessToken =
      (Array.isArray(accessTokenHeader)
        ? accessTokenHeader[0]
        : accessTokenHeader) || "";
  }

  if (!accessToken && req.body.accessToken) {
    accessToken = `${req.body.accessToken}`;
  }

  if (accessToken) {
    activeToken = await db.collection("accessTokens").findOne({
      token: accessToken,
      expire: { $gt: new Date() },
      isActive: true,
    });
  }

  if (activeToken) {
    next();
  } else {
    res.statusCode = 401;
    res.json({
      error: "Unauthorized",
    });
  }
});

export default router;
