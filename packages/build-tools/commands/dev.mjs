import nodemon from "nodemon";
export default function dev(entry) {
  const cwd =
    process.env["PNPM_SCRIPT_SRC_DIR"] ||
    process.env["INIT_CWD"] ||
    process.cwd();

  nodemon({
    cwd: cwd,
    script: entry,
    ext: "ts json js",
    nodeArgs: ["--inspect=localhost:9222", "-r", "ts-node/register"],
    restartable: true,
    watch: cwd,
    verbose: true,
    // dump: true,
    legacyWatch: true,
  })
    .on("start", () => {
      console.log(">>> Start");
    })
    .on("restart", () => {
      console.log(">>> Restart");
    });
}
