import express from "express"
import user from "./api/user"
import stories from "./api/stories/story"
import auth from "./api/auth"
import fields from "./api/fields"
import storyConfigs from "./api/stories/story_config"
import bodyParser from "body-parser"
import cors from "cors"

const app = express()
const port = process.env.PORT || 8000

app.use(bodyParser.urlencoded())
app.use(bodyParser.json())
app.use(cors())

app.use("/users", user)
app.use("/stories", stories)
app.use("/story-configs", storyConfigs)
app.use("/fields", fields)
app.use(auth)

app.listen(port, () => {
  console.log(`Listening on http:/localhost:${port}`)
})
