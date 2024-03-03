#!/usr/bin/env node
// Plenty CMS Build

import esbuild from "esbuild";
import path from "path";

const entry = process.argv[process.argv.length - 1];
const outdir = process.env["INIT_CWD"] || process.cwd();

esbuild.buildSync({
  entryPoints: [entry],
  bundle: true,
  platform: "node",
  packages: "external",
  outdir: path.join(outdir, "dist"),
});
