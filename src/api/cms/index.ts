import { Router } from "express"
import user from "./user"
import stories from "./stories/story"
import storyConfigs from "./stories/story_config"
import auth from "~/middleware/auth"

const router = Router()

router.use(auth({isAdmin: true}))

router.use("/users", user)
router.use("/stories", stories)
router.use("/story-configs", storyConfigs)

export default router