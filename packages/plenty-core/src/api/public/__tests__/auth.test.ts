import { describe, test, afterAll } from "vitest"
import app from "~/app"
import supertest from "supertest"

describe("Authentication endpoints", () => {
  afterAll(async () => {
    await app.close()
  })

  describe("POST /login", () => {
    test("user can't login without crendetials", async () => {
      await app.ready()

      await supertest(app.server).post("/login").send({}).expect(400)
    })

    test("user can't login with the wrong crendetials", async () => {
      await app.ready()

      await supertest(app.server)
        .post("/login")
        .send({
          email: "foo@bar.com",
          password: "fakepassword",
        })
        .expect(401)
    })

    test("user can't login without email", async () => {
      await app.ready()

      await supertest(app.server)
        .post("/login")
        .send({
          email: "foobar89",
          password: "fakepassword",
        })
        .expect(400)
    })
  })

  describe("POST /logout", () => {
    test("POST /logout fails without an accessToken", async () => {
      await app.ready()

      await supertest(app.server).post("/logout").expect(400)
    })

    test("POST /logout fails without a valid accessToken", async () => {
      await app.ready()

      await supertest(app.server)
        .post("/logout")
        .send({
          accessToken: "ac5bf577-1808-4aa8-93ab-be33f0920f84",
        })
        .expect(400)
    })
  })
})
