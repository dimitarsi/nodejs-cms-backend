#!/usr/bin/env node
// Plenty CMS Build

import path from "path";
import build from "../commands/build.mjs";
import dev from "../commands/dev.mjs";

const args = process.argv.slice(1);

const cwd =
  process.env["PNPM_SCRIPT_SRC_DIR"] ||
  process.env["INIT_CWD"] ||
  process.cwd();
const entry = args.find((arg) => arg.endsWith(".ts"));

console.log(">> args", {
  entry,
  dev: args.includes("dev"),
  outdir: path.join(cwd, "dist"),
  cwd: cwd,
});

if (args.includes("dev")) {
  dev(entry);
} else {
  build(entry, path.join(cwd, "dist"));
}
