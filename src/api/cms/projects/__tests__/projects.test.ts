import { describe, test, afterAll, expect } from "vitest"
import request from "supertest"
import createProjectPayload from "~/cli/seed/data/createProject"
import projects from "~/repo/projects"
import app from "~/app"
import { MongoClient } from "mongodb"

describe("Projects", () => {
  const slug = "slug"

  const mongoClient = new MongoClient(
    process.env.MONGO_URL || "mongodb://root:example@localhost:27017"
  )
  const db = mongoClient.db(process.env.DB_NAME)

  afterAll(async () => {
    await app.close()
  })

  describe("DB Seeded", () => {
    test("has accessTokens", async () => {
      const accessTokens = await (
        await db.collection("accessTokens").find({})
      ).toArray()
      expect(accessTokens).toHaveLength(2)
    })

    test("has users", async () => {
      const users = await (await db.collection("users").find({})).toArray()
      expect(users).toHaveLength(2)
    })
  })

  describe("Needs authentication", () => {
    test("POST /users - cannot create project - user needs to be logged in", async () => {
      await app.ready()
      await request(app.server)
        .post("/projects")
        .send(createProjectPayload)
        .expect(403)
    })

    test("GET /projects - user needs to be logged in", async () => {
      await app.ready()
      await request(app.server).get("/projects").expect(403)
    })

    test.skip("GET /projects/:idOrSlug - user needs to be logged in", async () => {
      await app.ready()
      await request(app.server).get(`/projects/${slug}`).expect(403)
    })

    test.skip("DELETE /projects/:idOrSlug - user needs to be logged in", async () => {
      await app.ready()
      await request(app.server).delete(`/projects/${slug}`).expect(403)
    })

    test.skip("PATCH /projects/:idOrSlug - user needs to be logged in", async () => {
      await app.ready()
      await request(app.server).delete(`/projects/${slug}`).expect(403)
    })
  })

  describe("Only Admins can create, delete, update and inspect projects", () => {
    const adminAccessToken: string = process.env.TEST_ADMIN_ACCESS_TOKEN!
    const nonAdminAccessToken: string = process.env.TEST_NON_ADMIN_ACCESS_TOKEN!

    describe("As Admin", () => {
      test("GET /projects", async () => {
        await app.ready()

        const resp = await request(app.server)
          .get("/projects")
          .set("X-Access-Token", adminAccessToken)
          .expect(200)

        // expect(resp.body).toHaveProperty("pagination")
        // expect(resp.body).toHaveProperty("items")
        expect(resp.body.length).toBeGreaterThan(0)
        expect(resp.body[0]).toHaveProperty("name")
        expect(resp.body[0]).toHaveProperty("owner")
        expect(resp.body[0].active).toBeTruthy()
      })

      test("POST /projects", async () => {
        const db = await mongoClient.db(process.env.DB_NAME)
        const repo = projects(db)

        await app.ready()

        const resp = await request(app.server)
          .post("/projects")
          .set("X-Access-Token", adminAccessToken)
          .send(createProjectPayload)
          .expect(201)
      })

      test.skip("PATCH /projects", async () => {
        const db = await mongoClient.db(process.env.DB_NAME)
        const repo = projects(db)

        await app.ready()
        const resp = await request(app.server)
          .post("/projects")
          .set("X-Access-Token", adminAccessToken)
          .send(createProjectPayload)
          .expect(201)

        await request(app.server)
          .patch(`/projects/${resp.body._id}`)
          .set("X-Access-Token", adminAccessToken)
          .send({
            email: "foo@bar.com",
            firstName: "Hello",
            lastName: "World",
          })
          .expect(200)
      })
    })

    describe.skip("As Non-Admin", () => {
      // test("GET /projects - is Forbidden", async () => {
      //   await app.ready()
      //   await request(app.server)
      //     .get("/projects")
      //     .set("X-Access-Token", nonAdminAccessToken)
      //     .expect(403)
      // })
      // test("GET /projects/:id - is Forbidden", async () => {
      //   const db = await mongoClient.db(process.env.DB_NAME)
      //   const repo = projects(db)
      //   await repo.deleteAll()
      //   await app.ready()
      //   const resp = await request(app.server)
      //     .post("/projects")
      //     .set("X-Access-Token", adminAccessToken)
      //     .send(createProjectPayload)
      //     .expect(201)
      //   await request(app.server)
      //     .get(`/projects/${resp.body._id}`)
      //     .set("X-Access-Token", nonAdminAccessToken)
      //     .expect(403)
      // })
      // test("POST /projects - is Forbidden", async () => {
      //   const db = await mongoClient.db(process.env.DB_NAME)
      //   const repo = projects(db)
      //   await repo.deleteAll()
      //   await app.ready()
      //   await request(app.server)
      //     .post("/projects")
      //     .set("X-Access-Token", nonAdminAccessToken)
      //     .send(createProjectPayload)
      //     .expect(403)
      // })
      // test("POST /projects - can create only one user with the same email - is Forbidden", async () => {
      //   const db = await mongoClient.db(process.env.DB_NAME)
      //   const repo = projects(db)
      //   await repo.deleteAll()
      //   await app.ready()
      //   const resp = await request(app.server)
      //     .post("/projects")
      //     .set("X-Access-Token", adminAccessToken)
      //     .send(createProjectPayload)
      //     .expect(201)
      //   expect(resp.body).toHaveProperty("_id")
      //   expect(resp.body).toHaveProperty("firstName")
      //   expect(resp.body).toHaveProperty("email")
      //   expect(resp.body).toHaveProperty("isActive")
      //   expect(resp.body).not.toHaveProperty("password")
      //   expect(resp.body.isActive).toBeFalsy()
      //   expect(resp.header["location"]).toMatch(/^\/users\/([^/]+)$/)
      //   await request(app.server)
      //     .post("/projects")
      //     .set("X-Access-Token", nonAdminAccessToken)
      //     .send(createProjectPayload)
      //     .expect(403)
      // })
      // test("PATCH /projects - is Forbidden", async () => {
      //   const db = await mongoClient.db(process.env.DB_NAME)
      //   const repo = projects(db)
      //   await repo.deleteAll()
      //   await app.ready()
      //   const resp = await request(app.server)
      //     .post("/projects")
      //     .set("X-Access-Token", adminAccessToken)
      //     .send(createProjectPayload)
      //     .expect(201)
      //   await request(app.server)
      //     .patch(`/projects/${resp.body._id}`)
      //     .set("X-Access-Token", nonAdminAccessToken)
      //     .send(createProjectPayload)
      //     .expect(403)
      // })
    })
  })
})
