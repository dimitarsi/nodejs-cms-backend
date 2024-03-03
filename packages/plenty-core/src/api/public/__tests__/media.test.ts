import supertest from "supertest"
import app from "~/app"
import { expect, describe, test, afterAll } from "vitest"

describe("Media", () => {
  afterAll(() => {
    app.close()
  })

  test("Endpoint is reachable but no file is found in db", async () => {
    await app.ready()
    const result = await supertest(app.server).get("/media/fakeid").expect(404)

    expect(result.body.message).toBe("No such file in DB")
  })
})
