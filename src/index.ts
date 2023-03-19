import dotenv from "dotenv"
// import server from "./server"

dotenv.config()

import("./connect/db").then(
  () => import('./server')
)