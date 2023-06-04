import {type Request, Response} from 'express'
import {getPath} from '@repo/media'
import fs from "fs"


export const mediaHandler = async (req: Request, res: Response) => {
  const filePath = await getPath(req.params['hash']);

  if(!filePath || fs.existsSync(filePath) === false) {
    res.status(404);
    res.json({error: "No such file in DB"})
    return;
  }
  
  const stream = fs.createReadStream(filePath)
  
  stream.pipe(res);
  stream.on('error', () => {
    res.status(400);
  })
}