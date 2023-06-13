import express from 'express';
import multer from 'multer'
import { insertMany, updateMedia } from '@repo/media';
import fileType from '~/helpers/fileType';

const app = express();
const upload = multer({dest: 'uploads', })

app.post('/', upload.array('attachments'), async (req, res) => {
  const entries: any[] = [];
  
  for (const f of req.files as any[]) {
    entries.push({
      path: f.path,
      mimetype: f.mimetype,
      filetype: (await fileType(f.path)),
      originalName: f.originalname,
      size: f.size
    })
  }
  try {
    const resp = await insertMany(entries);
    res.status(200).json(entries.map((entry, idx) =>({
      id: resp.insertedIds[idx],
      name: entry.originalName,
      type: entry.filetype
    })))
  } catch (e) {
    res.status(400).json({ ok: false })

  }
})

app.put('/:hash', upload.array('attachment'), async (req, res) => {
  const entries: any[] = [];

  if(!req.params.hash) {
    res.status(404);
    res.send();
    return
  }

  let mediaData = req.body

  if(req.file) {
    mediaData = {
      ...mediaData,
      path: req.file.path,
      mimetype: req.file.mimetype,
      filetype: (await fileType(req.file.path)),
      originalName: req.file.originalname,
      size: req.file.size
    }
  }

  await updateMedia(req.params.hash, mediaData)
  
  res.status(200);
  res.send()
})

export default app;