import { Router } from "express"
import user from "./user"
import stories from "./content"
import contentTypes from "./contentTypes"
import auth from "~/middleware/auth"
import uploadHandler from "./files"
// import components from './components'

const router = Router()

router.use(auth({ isAdmin: true }))

router.use("/users", user)
router.use("/content", stories)
router.use("/content_types", contentTypes)
router.use("/attachments", uploadHandler)
// router.use('/components', components)
router.use("/check", (_, res) => res.status(200).send())

export default router
