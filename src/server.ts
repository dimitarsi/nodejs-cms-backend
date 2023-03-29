import express from "express"
import user from "./api/user"
import posts from './api/posts'
import auth from './api/auth'
import fields from "./api/fields";
import postConfigs from './api/post_config'
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
const port = process.env.PORT || 8000;

app.use(bodyParser.urlencoded())
app.use(bodyParser.json());
app.use(cors());

app.use("/users", user);
app.use('/posts', posts);
app.use('/post-config', postConfigs)
app.use('/fields', fields)
app.use(auth)

app.listen(port, () => {
  console.log(`Listening on http:/localhost:${port}`);
});
