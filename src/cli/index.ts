import seed from "./seed"

if (process.argv.includes('--seed')) {
  seed().then(() => {
    console.log("Done")
    process.exit(0)
  })
}
