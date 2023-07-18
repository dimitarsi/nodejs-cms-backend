import contentTypesRepo from "@repo/contentTypes"
import contentRepo from "@repo/content"
import usersRepo from "@repo/users"
import authRepo from "@repo/auth"
import accessTokens from "@repo/accessTokens"
import mediaRepo from "@repo/media"
import fs from "fs"
import path from "path"

export default async function removeData() {

  const mediaDir = path.join(process.cwd(), "./uploads/") 

  const files = fs.readdirSync(mediaDir)

  files.forEach((file) => {
    fs.unlink(path.join(mediaDir, file), (err) => {
      if (err) {
        console.error(`Unable to remove ${mediaDir} ${file} - ${err}`)
      } else {
        console.log("RM ", path.join(mediaDir, file))
      }
    })
  })

  

  return Promise.all([
    contentTypesRepo.deleteAll(),
    contentRepo.deleteAll(),
    // usersRepo.deleteAll(),
    // authRepo.deleteAll(),
    // accessTokens.deleteAll(),
    mediaRepo.deleteAll(),
  ])
}