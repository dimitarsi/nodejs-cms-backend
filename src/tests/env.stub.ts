// import { vi } from "vitest"

export default async function () {
  console.log(">> Setup env")

  process.env.TEST_ADMIN_ACCESS_TOKEN = "this-is-admin-access-token"
  process.env.TEST_NON_ADMIN_ACCESS_TOKEN = "this-is-non-admin-access-token"
  process.env.DB_NAME = "plenty_cms_test"
}
