import auth from "./auth"
import { Router } from "express"

const router = Router()

router.use(auth)

export default router