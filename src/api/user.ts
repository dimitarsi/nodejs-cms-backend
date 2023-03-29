import { ObjectId } from 'mongodb';
import {withDefaultRoutes} from "./controller";
import users from '../repo/users'
import express from 'express';

const app = express();

withDefaultRoutes(app, users);

app.post('/:id/activate', async (req, res) => {
  const {id} = req.params
  
  await users.activate(id)

  res.json({success: true})
})

export default app