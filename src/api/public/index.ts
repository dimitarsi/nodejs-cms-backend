import auth from "./auth"
import Router from "~/core/api/router"
import { mediaHandler } from "./media"

const router = Router()

router.use(auth)
router.get("/media/:hash", mediaHandler)

export default router
