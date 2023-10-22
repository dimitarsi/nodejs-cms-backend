import db from "@db"
import Router from "~/core/api/router"

export default (router: ReturnType<typeof Router>) => {
  router.post("/logout-all", async function logoutAll(req, res) {
    try {
      db.collection("accessTokens").deleteMany()
      res.json({
        success: true,
      })
    } catch (e) {
      res.status(400).json({ success: false })
    }
    return
  })
}
