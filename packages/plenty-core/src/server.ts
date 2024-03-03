import app from "./app"

const port = parseInt(process.env.PORT || "8000")

const server = app.listen({
  port: isNaN(port) ? 8000 : port,
}, (err, address) => {
  if (!err) console.log('>> Server started:', address)
  else console.error(err)
})

export default server
