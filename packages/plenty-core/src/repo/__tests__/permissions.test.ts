import { describe, expect, beforeEach, afterAll, test } from "vitest"
import mongoClient from "@db"
import permissions from "../permissions"
import { ObjectId } from "mongodb"

describe("Permissions Repo", async () => {
  const db = await mongoClient.db(`${process.env.DB_NAME}-repo`)
  let repo = permissions(db)
  const testProjectId = new ObjectId()

  beforeEach(async () => {
    await repo.deleteAll(testProjectId)
  })

  afterAll(() => {
    mongoClient.close(true)
  })

  test("grant and deny admin permissions to user", async () => {
    const testUserId = new ObjectId()

    const result = await repo.setAdminUser(testUserId, testProjectId, "grant")

    expect(result).toBeTruthy()

    expect(
      await repo.hasManagePermission(testUserId, testProjectId)
    ).toBeTruthy()
    expect(
      await repo.hasWritePermission(testUserId, testProjectId)
    ).toBeTruthy()
    expect(await repo.hasReadPermission(testUserId, testProjectId)).toBeTruthy()

    await repo.setAdminUser(testUserId, testProjectId, "revoke")

    expect(
      await repo.hasManagePermission(testUserId, testProjectId)
    ).toBeFalsy()
    expect(await repo.hasWritePermission(testUserId, testProjectId)).toBeFalsy()
    expect(await repo.hasReadPermission(testUserId, testProjectId)).toBeFalsy()
  })

  test("Dany any permission", async () => {
    const testUserId = new ObjectId()

    let result = await repo.setAdminUser(testUserId, testProjectId, "revoke")

    expect(result.ok).toBeTruthy()

    expect(await repo.hasReadPermission(testUserId, testProjectId)).toBeFalsy()
    expect(await repo.hasWritePermission(testUserId, testProjectId)).toBeFalsy()
    expect(
      await repo.hasManagePermission(testUserId, testProjectId)
    ).toBeFalsy()
  })

  test("Setting only partial permission - Read", async () => {
    const testUserId = new ObjectId()

    let result = await repo.setAdminUser(testUserId, testProjectId, "revoke")

    result = await repo.setReadPermissions(testUserId, testProjectId, "grant")

    expect(result.ok).toBeTruthy()

    expect(await repo.hasReadPermission(testUserId, testProjectId)).toBeTruthy()
    expect(await repo.hasWritePermission(testUserId, testProjectId)).toBeFalsy()
    expect(
      await repo.hasManagePermission(testUserId, testProjectId)
    ).toBeFalsy()
  })

  test("Setting only partial permission - Write", async () => {
    const testUserId = new ObjectId()

    let result = await repo.setAdminUser(testUserId, testProjectId, "revoke")

    result = await repo.setWritePermissions(testUserId, testProjectId, "grant")

    expect(result.ok).toBeTruthy()

    expect(await repo.hasReadPermission(testUserId, testProjectId)).toBeTruthy()
    expect(
      await repo.hasWritePermission(testUserId, testProjectId)
    ).toBeTruthy()
    expect(
      await repo.hasManagePermission(testUserId, testProjectId)
    ).toBeFalsy()
  })

  test("Setting only partial permission - Manage", async () => {
    const testUserId = new ObjectId()

    let result = await repo.setAdminUser(testUserId, testProjectId, "revoke")

    result = await repo.setManagePermissions(testUserId, testProjectId, "grant")

    expect(result.ok).toBeTruthy()

    expect(await repo.hasReadPermission(testUserId, testProjectId)).toBeTruthy()
    expect(
      await repo.hasWritePermission(testUserId, testProjectId)
    ).toBeTruthy()
    expect(
      await repo.hasManagePermission(testUserId, testProjectId)
    ).toBeTruthy()
  })
})
