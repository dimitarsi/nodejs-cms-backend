import fs from "fs"
import path from "path"
import { type Db } from "mongodb"
import mediaRepo from "~/repo/media"
import contentRepo from "~/repo/contents"
import contentTypesRepo from "~/repo/contentTypes"
import usersRepo from "~/repo/users"
import projectsRepo from "~/repo/projects"

export default async function removeData(db: Db) {
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
    contentTypesRepo(db).deleteAll(),
    contentRepo(db).deleteAll(),
    usersRepo(db).deleteAll(),
    projectsRepo(db).deleteAll(),
    // authRepo.deleteAll(),
    // accessTokens.deleteAll(),
    mediaRepo(db).deleteAll(),
  ])
}
