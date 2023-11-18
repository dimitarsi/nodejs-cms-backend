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
    const adminAccessToken: string = process.env.TEST_ADMIN_ACCESS_TOKEN!
    const nonAdminAccessToken: string = process.env.TEST_NON_ADMIN_ACCESS_TOKEN!

    describe("As Admin", () => {
      test("GET /users", async () => {
        await app.ready()
        const resp = await request(app.server)
          .get("/users")
          .set("X-Access-Token", adminAccessToken)
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
          .set("X-Access-Token", adminAccessToken)
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
          .set("X-Access-Token", adminAccessToken)
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
          .set("X-Access-Token", adminAccessToken)
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
          .set("X-Access-Token", adminAccessToken)
          .send(createUserPayload)
          .expect(201)

        await request(app.server)
          .patch(`/users/${resp.body._id}`)
          .set("X-Access-Token", adminAccessToken)
          .send({
            email: "foo@bar.com",
            firstName: "Hello",
            lastName: "World",
          })
          .expect(200)
      })
    })

    describe("As Non-Admin", () => {
      test("GET /users - is Forbidden", async () => {
        await app.ready()
        await request(app.server)
          .get("/users")
          .set("X-Access-Token", nonAdminAccessToken)
          .expect(403)
      })

      test("GET /users/:id - is Forbidden", async () => {
        const db = await mongoClient.db(process.env.DB_NAME)
        const repo = users(db)

        await repo.deleteAll()

        await app.ready()
        const resp = await request(app.server)
          .post("/users")
          .set("X-Access-Token", adminAccessToken)
          .send(createUserPayload)
          .expect(201)

        await request(app.server)
          .get(`/users/${resp.body._id}`)
          .set("X-Access-Token", nonAdminAccessToken)
          .expect(403)
      })

      test("POST /users - is Forbidden", async () => {
        const db = await mongoClient.db(process.env.DB_NAME)
        const repo = users(db)

        await repo.deleteAll()

        await app.ready()
        await request(app.server)
          .post("/users")
          .set("X-Access-Token", nonAdminAccessToken)
          .send(createUserPayload)
          .expect(403)
      })

      test("POST /users - can create only one user with the same email - is Forbidden", async () => {
        const db = await mongoClient.db(process.env.DB_NAME)
        const repo = users(db)

        await repo.deleteAll()

        await app.ready()
        const resp = await request(app.server)
          .post("/users")
          .set("X-Access-Token", adminAccessToken)
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
          .set("X-Access-Token", nonAdminAccessToken)
          .send(createUserPayload)
          .expect(403)
      })

      test("PATCH /users - is Forbidden", async () => {
        const db = await mongoClient.db(process.env.DB_NAME)
        const repo = users(db)

        await repo.deleteAll()

        await app.ready()
        const resp = await request(app.server)
          .post("/users")
          .set("X-Access-Token", adminAccessToken)
          .send(createUserPayload)
          .expect(201)

        await request(app.server)
          .patch(`/users/${resp.body._id}`)
          .set("X-Access-Token", nonAdminAccessToken)
          .send({
            email: "foo@bar.com",
            firstName: "Hello",
            lastName: "World",
          })
          .expect(403)
      })
    })
  })
})
