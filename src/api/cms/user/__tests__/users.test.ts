import { describe, test } from "@jest/globals"
import app from "../../../../app"
import request from "supertest"
import createUserPayload from "~/cli/seed/data/createUser"
import users from "~/repo/users"
import mongoClient from "@db"

describe("Authentication", () => {
  const slug = "slug"

  afterAll(() => {
    app.close()
  })

  describe("Needs authentication", () => {
    test("POST /users - cannot create user is not logged in first", async () => {
      await app.ready()
      await request(app.server)
        .post("/users")
        .send(createUserPayload)
        .expect(403)
    })

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

  describe("Only Admins can create, delete, update and inspect users", () => {
    const accessToken: string = process.env.TEST_ACCESS_TOKEN!

    test("GET /users", async () => {
      await app.ready()
      const resp = await request(app.server)
        .get("/users")
        .set("X-Access-Token", accessToken)
        .expect(200)

      expect(resp.body).toHaveProperty("pagination")
      expect(resp.body).toHaveProperty("items")
    })

    test("POST /users", async () => {
      const db = await mongoClient.db(process.env.DB_NAME)
      const repo = users(db)

      await repo.deleteAll()

      await app.ready()
      const resp = await request(app.server)
        .post("/users")
        .set("X-Access-Token", accessToken)
        .send(createUserPayload)
        .expect(201)

      expect(resp.body).toHaveProperty("_id")
      expect(resp.body).toHaveProperty("firstName")
      expect(resp.body).toHaveProperty("email")
      expect(resp.body).toHaveProperty("isActive")
      expect(resp.body).not.toHaveProperty("password")
      expect(resp.body.isActive).toBeFalsy()
      expect(resp.header["location"]).toMatch(/^\/users\/([^/]+)$/)
    })

    test("POST /users - can create only one user with the same email", async () => {
      const db = await mongoClient.db(process.env.DB_NAME)
      const repo = users(db)

      await repo.deleteAll()

      await app.ready()
      const resp = await request(app.server)
        .post("/users")
        .set("X-Access-Token", accessToken)
        .send(createUserPayload)
        .expect(201)

      expect(resp.body).toHaveProperty("_id")
      expect(resp.body).toHaveProperty("firstName")
      expect(resp.body).toHaveProperty("email")
      expect(resp.body).toHaveProperty("isActive")
      expect(resp.body).not.toHaveProperty("password")
      expect(resp.body.isActive).toBeFalsy()
      expect(resp.header["location"]).toMatch(/^\/users\/([^/]+)$/)

      await request(app.server)
        .post("/users")
        .set("X-Access-Token", accessToken)
        .send(createUserPayload)
        .expect(422)
    })

    test("PATCH /users", async () => {
      const db = await mongoClient.db(process.env.DB_NAME)
      const repo = users(db)

      await repo.deleteAll()

      await app.ready()
      const resp = await request(app.server)
        .post("/users")
        .set("X-Access-Token", accessToken)
        .send(createUserPayload)
        .expect(201)

      await request(app.server)
        .patch(`/users/${resp.body._id}`)
        .set("X-Access-Token", accessToken)
        .send({ email: "foo@bar.com", firstName: "Hello", lastName: "World" })
        .expect(200)
    })

    test.skip("PATCH /users - cannot update password without confirmation", async () => {
      const db = await mongoClient.db(process.env.DB_NAME)
      const repo = users(db)

      await repo.deleteAll()

      await app.ready()
      const resp = await request(app.server)
        .post("/users")
        .set("X-Access-Token", accessToken)
        .send(createUserPayload)
        .expect(201)

      await request(app.server)
        .patch(`/users/${resp.body._id}`)
        .set("X-Access-Token", accessToken)
        .send({
          password: "this is the new password",
        })
        .expect(422)
    })
  })
})
