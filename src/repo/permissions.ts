import { Db, ObjectId } from "mongodb"
import { ensureObjectId } from "~/helpers/objectid"
import { ProjectPermission } from "~/models/permissions"

export default function permissions(db: Db) {
  const collection = db.collection<ProjectPermission>("permissions", {})

  const updatePermissionField =
    (field: "read" | "write" | "manage" | "all") =>
    async (
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

      return await collection.findOneAndUpdate(
        {
          userId: ensureObjectId(userId),
          projectId: ensureObjectId(projectId),
        },
        {
          $set: properties,
        },
        {
          upsert: true,
          includeResultMetadata: true, // prevent return `null` when a new document is created
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

  /**
   *
   * @param projectId - prevent accidental deletion of ALL projects permissions
   * @returns
   */
  const deleteAll = (projectId: string | ObjectId) => {
    return collection.deleteMany({ projectId: ensureObjectId(projectId) })
  }

  return {
    setAdminUser,
    setReadPermissions,
    setWritePermissions,
    setManagePermissions,
    hasReadPermission,
    hasWritePermission,
    hasManagePermission,
    deleteAll,
  }
}
