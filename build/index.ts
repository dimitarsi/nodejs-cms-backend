import esbuild from "esbuild"

esbuild.buildSync({
  entryPoints: ["src/server.ts"],
  bundle: true,
  platform: "node",
  packages: "external",
  outdir: "dist",
})
