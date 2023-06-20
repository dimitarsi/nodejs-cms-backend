import defaultController from "~/core/api/controller";
import components from "@repo/components";
import express from "express";

const app = express()

export default defaultController(app, components);