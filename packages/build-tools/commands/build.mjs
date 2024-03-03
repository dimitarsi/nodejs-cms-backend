import esbuild from "esbuild";

export default function build(entry, outdir) {
  esbuild.buildSync({
    entryPoints: [entry],
    bundle: true,
    platform: "node",
    packages: "external",
    outdir: path.join(outdir, "dist"),
  });
}
