import auth from "./auth"
import { Router } from "express"
import { mediaHandler } from "./media"

const router = Router()

router.use(auth)
router.get("/media/:hash", mediaHandler)

export default router
