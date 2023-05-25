import auth from "./auth"
import { Router } from "express"
import uploadHandler from '../cms/files'


const router = Router()

router.use(auth)

router.use('/attachments', uploadHandler)

export default router