import dotenv from "dotenv"
import path from "path"

export function setup() {
  console.log(`>Loading [../../.env.${process.env.ENVIRONMENT}]`)

  dotenv.config({
    // load .env.test
    path: path.resolve(__dirname, `../../.env.${process.env.ENVIRONMENT}`),
  })
}
