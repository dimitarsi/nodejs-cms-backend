import app from "./app"

const port = parseInt(process.env.PORT || "8000")

const server = app.listen({
  port: isNaN(port) ? 8000 : port,
})

export default server
