import { describe, test } from "@jest/globals"
import app from "../../../app"
import request from "supertest"
import createUserPayload from "~/cli/seed/data/createUser"

describe("Authentication", () => {
  const slug = "slug"

  afterAll(() => {
    app.close()
  })

  test("POST /users - cannot create user is not logged in first", async () => {
    await app.ready()
    await request(app.server).post("/users").send(createUserPayload).expect(403)
  })

  describe("Needs authentication", () => {
    test("GET /users - user needs to be logged in", async () => {
      await app.ready()
      await request(app.server).get("/users").expect(403)
    })

    test("GET /users/:idOrSlug - user needs to be logged in", async () => {
      await app.ready()
      await request(app.server).get(`/users/${slug}`).expect(403)
    })

    test("DELETE /users/:idOrSlug - user needs to be logged in", async () => {
      await app.ready()
      await request(app.server).delete(`/users/${slug}`).expect(403)
    })

    test("PATCH /users/:idOrSlug - user needs to be logged in", async () => {
      await app.ready()
      await request(app.server).delete(`/users/${slug}`).expect(403)
    })
  })
})
