import seed from "./seed"
import removeData from "./seed/remove"

if (process.argv.includes('--seed')) {
  seed().then(() => {
    console.log("Done")
    process.exit(0)
  })
}

if (process.argv.includes("--reseed")) {

  removeData()
    .then(() => seed())
    .then(() => {
      console.log("Done")
      process.exit(0)
    })
}

