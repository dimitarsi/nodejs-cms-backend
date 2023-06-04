import db from '@db';
import express from 'express';
import multer from 'multer'
import { insertMany } from '@repo/media';

const app = express();
const upload = multer({dest: 'uploads', })

app.post('/', upload.array('attachments'), async (req, res) => {
  const entries: any[] = [];

  for (const f of req.files as any[]) {
    entries.push({
      path: f.path,
      mimetype: f.mimetype,
      originalName: f.originalname,
      size: f.size
    })
  }
  try {
    const resp = await insertMany(entries);
    res.status(200).json(entries.map((entry, idx) =>({
      id: resp.insertedIds[idx],
      name: entry.originalName
    })))
  } catch (e) {
    res.status(400).json({ ok: false })

  }
  
})

export default app;