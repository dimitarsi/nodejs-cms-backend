import controller from "../controller";
import auth from "../../middleware/auth";
import express from "express";
import "./schema";

const app = express();

app.use(auth);
app.use(controller("storiesConfig"));

export default app;
