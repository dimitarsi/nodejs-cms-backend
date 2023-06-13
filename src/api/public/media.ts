import {type Request, Response} from 'express'
import {getPath} from '@repo/media'
import fs from "fs"


export const mediaHandler = async (req: Request, res: Response) => {
  const {path, filetype} = await getPath(req.params['hash']);

  if(!path || fs.existsSync(path) === false) {
    res.status(404);
    res.json({error: "No such file in DB"})
    return;
  }
  if(filetype) {
    res.setHeader('content-type', filetype);
  }

  const stream = fs.createReadStream(path)
  
  stream.pipe(res);
  stream.on('error', () => {
    res.status(400);
  })
}