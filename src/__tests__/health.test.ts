import { describe, test, afterAll, expect } from "vitest"
import request from "supertest"
import app from "../app"

describe("Health check", () => {
  afterAll(() => {
    app.close()
  })

  test("has a health check endpoint", async () => {
    await app.ready()
    const resp = await request(app.server).get("/health").expect(200)

    expect(resp).toBeDefined()
  })
})
