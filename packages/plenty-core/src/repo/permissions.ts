import { Db, ObjectId } from "mongodb"
import { ensureObjectId } from "~/helpers/objectid"
import { ProjectPermission } from "~/models/permissions"

/**
 * TODO:
 *  Implement permission with numbered levels instead of strings
 *
 * Example:
 *  accessLevel: 1 -> Read
 *  accessLevel: 10 -> Write
 *  accessLevel: 100 -> Manage
 */
export default function permissions(db: Db) {
  const collection = db.collection<ProjectPermission>("permissions", {})

  const updatePermissionField =
    (field: "read" | "write" | "manage" | "all") =>
    async (
      userId: string | ObjectId,
      projectId: string | ObjectId,
      type: "grant" | "revoke"
    ) => {
      const properties = getProperties(field, type)

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

  const gerPermissionsForUser = async (
    userId: string | ObjectId,
    accessLevel: {
      read?: boolean
      write?: boolean
      manage?: boolean
    }
  ) => {
    return await (
      await collection.find({
        userId: ensureObjectId(userId),
        ...accessLevel,
      })
    ).toArray()
  }

  const deleteForUser = (userId: ObjectId | string) => {
    return collection.deleteMany({ userId: ensureObjectId(userId) })
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
    gerPermissionsForUser,
    deleteForUser,
  }
}

export const setAccessLevelForAll = (accessLevel: boolean) => ({
  read: accessLevel,
  write: accessLevel,
  manage: accessLevel,
})

export const getAccessLevelOnly = (
  accessLevel: boolean,
  field: "read" | "write" | "manage"
) => ({
  ...setAccessLevelForAll(false),
  [field]: accessLevel,
})

export const getProperties = (
  field: "read" | "write" | "manage" | "all",
  type: "grant" | "revoke"
) => {
  const accessLevel = type === "grant"
  const properties =
    field === "all"
      ? setAccessLevelForAll(accessLevel)
      : getAccessLevelOnly(accessLevel, field)

  return properties
}
