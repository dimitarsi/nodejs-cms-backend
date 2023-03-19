import express from "express"
import user from "./api/user"
import posts from './api/posts'
import auth from './api/auth'
import fields from "./api/fields";
import postConfigs from './api/post_config'
import {json} from "body-parser"

const app = express();
const port = process.env.PORT || 8000;

app.use(json());

app.use("/users", user);
app.use('/posts', posts);
app.use('/post-config', postConfigs)
app.use('/fields', fields)
app.use(auth)

app.listen(port, () => {
  console.log(`Listening on http:/localhost:${port}`);
});
