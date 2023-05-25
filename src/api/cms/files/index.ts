import db from '@db';
import express from 'express';
import multer from 'multer'

const app = express();
const upload = multer({dest: 'uploads', })

app.post('/', upload.array('attachments'), async (req, res) => {
  console.log('>>', req.files)
  // const files = req.files;

  // if (Array.isArray(files) === false) {
  //   res.status(200).json({empty: "true"})
  // }

  // const entries = files?.map((f) => {
  //   return {
  //     path: f.path,
  //     mimetype: f.mimetype,
  //     size: f.size,
  //   }
  // });
  const entries: object[] = [];

  for (const f of req.files as any[]) {
    entries.push({
      path: f.path,
      mimetype: f.mimetype,
      originalName: f.originalname,
      size: f.size
    })
  }
  try {
    const resp = await db.collection("files").insertMany(entries);
    res.status(200).json({ ok: true, ids: resp.insertedIds })

    console.log('>> responses', resp)
  } catch (e) {
    console.error(e)
        res.status(400).json({ ok: false })

  }
  
})

export default app;