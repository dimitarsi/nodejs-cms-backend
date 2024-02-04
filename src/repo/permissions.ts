import { Db, ObjectId } from "mongodb"
import { ensureObjectId } from "~/helpers/objectid"

export default function permissions(db: Db) {
  const collection = db.collection("permissions", {})

  const updatePermissionField =
    (field: "read" | "write" | "manage" | "all") =>
    (
      userId: string | ObjectId,
      projectId: string | ObjectId,
      type: "grant" | "revoke"
    ) => {
      const accessLevel = type === "grant"
      const properties =
        field === "all"
          ? {
              read: accessLevel,
              write: accessLevel,
              manage: accessLevel,
            }
          : { [field]: accessLevel }

      return collection.findOneAndUpdate(
        {
          userId: ensureObjectId(userId),
          projectId: ensureObjectId(projectId),
        },
        {
          $set: properties,
        }
      )
    }

  const setAdminUser = updatePermissionField("all")

  const setReadPermissions = updatePermissionField("read")

  const setWritePermissions = updatePermissionField("write")

  const setManagePermissions = updatePermissionField("manage")

  const hasPermissionsLevel =
    (levels: Array<{ read: true } | { write: true } | { manage: true }>) =>
    async (userId: ObjectId | string, projectId: ObjectId | string) => {
      const result = await collection.findOne({
        userId: ensureObjectId(userId),
        projectId: ensureObjectId(projectId),
        $or: [...levels],
      })

      return result !== null
    }

  const hasReadPermission = hasPermissionsLevel([
    { read: true },
    { write: true },
    { manage: true },
  ])

  const hasWritePermission = hasPermissionsLevel([
    { write: true },
    { manage: true },
  ])

  const hasManagePermission = hasPermissionsLevel([{ manage: true }])

  return {
    setAdminUser,
    setReadPermissions,
    setWritePermissions,
    setManagePermissions,
    hasReadPermission,
    hasWritePermission,
    hasManagePermission,
  }
}
