import express from "express"
import bodyParser from "body-parser"
import cors from "cors"
import publicAPI from '~/api/public'
import cmsAPI from '~/api/cms'


const app = express()
const port = process.env.PORT || 8000

app.use(bodyParser.urlencoded())
app.use(bodyParser.json())
app.use(cors())


app.use(publicAPI)
app.use(cmsAPI)


// app.use(auth)

app.listen(port, () => {
  console.log(`Listening on http:/localhost:${port}`)
})
