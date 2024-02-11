import { PermissionsRepo } from "./../../../../repo/index"
import { describe, test, afterAll, beforeAll, afterEach, expect } from "vitest"
import request from "supertest"
import { createProjectPayload } from "~/cli/seed/data/createProject"
import app from "~/app"
import { MongoClient, ObjectId, WithId } from "mongodb"
import accessTokens from "~/repo/accessTokens"
import users from "~/repo/users"
import { createUserPayload } from "~/cli/seed/data/createUser"
import permissions from "~/repo/permissions"

describe("Projects", async () => {
  const slug = "slug"

  const mongoClient = new MongoClient(
    process.env.MONGO_URL || "mongodb://root:example@localhost:27017"
  )
  const db = await mongoClient.db(process.env.DB_NAME)
  const accessTokensRepo = accessTokens(db)
  const permissionsRepo = permissions(db)

  const PROJECTS_API_ADMIN_TOKEN = "projects-API-admin-token"
  const PROJECTS_API_NON_ADMIN_TOKEN = "projects-API-non-admin-token"

  const projectId = new ObjectId()
  const userId = new ObjectId()
  const otherUserId = new ObjectId()

  // Seed tokens
  beforeAll(async () => {
    await Promise.all([
      permissionsRepo.setAdminUser(userId, projectId, "grant"),
      permissionsRepo.setAdminUser(otherUserId, projectId, "revoke"),
      accessTokensRepo.findOrCreateAccessToken(
        userId,
        PROJECTS_API_ADMIN_TOKEN
      ),
      accessTokensRepo.findOrCreateAccessToken(
        otherUserId,
        PROJECTS_API_NON_ADMIN_TOKEN
      ),
    ])
  })

  afterAll(async () => {
    await accessTokensRepo.deactivateToken(PROJECTS_API_ADMIN_TOKEN)
    await accessTokensRepo.deactivateToken(PROJECTS_API_NON_ADMIN_TOKEN)

    await app.close()
    await mongoClient.close()
  })

  afterEach(async () => {
    await db.collection("contents").deleteMany({})
  })

  describe("Needs authentication", () => {
    test("POST /users - cannot create project - user needs to be logged in", async () => {
      await app.ready()
      await request(app.server)
        .post("/projects")
        .send(createProjectPayload(userId))
        .expect(403)
    })

    test("GET /projects - user needs to be logged in", async () => {
      await app.ready()
      await request(app.server).get("/projects").expect(403)
    })

    test("GET /projects/:idOrSlug - user needs to be logged in", async () => {
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
    describe("As Admin", () => {
      test("POST /projects", async () => {
        await app.ready()

        const resp = await request(app.server)
          .post("/projects")
          .set("X-Access-Token", PROJECTS_API_ADMIN_TOKEN)
          .send(createProjectPayload(userId))
          .expect(201)
      })

      test("GET /projects", async () => {
        await app.ready()

        const resp = await request(app.server)
          .get("/projects")
          .set("X-Access-Token", PROJECTS_API_ADMIN_TOKEN)
          .expect(200)

        expect(resp.body.length).toBeGreaterThan(0)
        expect(resp.body[0]).toHaveProperty("name")
        expect(resp.body[0]).toHaveProperty("owner")
        expect(resp.body[0].active).toBeTruthy()
      })

      test.skip("PATCH /projects", async () => {
        await app.ready()
        const resp = await request(app.server)
          .post("/projects")
          .set("X-Access-Token", PROJECTS_API_ADMIN_TOKEN)
          .send(createProjectPayload)
          .expect(201)

        await request(app.server)
          .patch(`/projects/${resp.body._id}`)
          .set("X-Access-Token", PROJECTS_API_ADMIN_TOKEN)
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
