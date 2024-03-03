import { describe, test, afterAll, beforeAll, afterEach, expect } from "vitest"
import { MongoClient, ObjectId } from "mongodb"
import { compositeContentType } from "~/models/contentType"
import supertest from "supertest"
import app from "~/app"
import accessTokens from "~/repo/accessTokens"
import permissions from "~/repo/permissions"

describe("ContentTypes", async () => {
  const mongoClient = new MongoClient(
    process.env.MONGO_URL || "mongodb://root:example@localhost:27017"
  )
  const db = await mongoClient.db(process.env.DB_NAME)
  const accessTokensRepo = accessTokens(db)
  const permissionsRepo = permissions(db)

  const CONENT_TYPES_API_ADMIN_TOKEN = "content-types-API-admin-token"
  const CONENT_TYPES_API_NON_ADMIN_TOKEN = "content-types-API-non-admin-token"

  const projectId = new ObjectId().toString()
  const userId = new ObjectId()
  const nonAdminUserId = new ObjectId()

  // Seed tokens
  beforeAll(async () => {
    await Promise.all([
      permissionsRepo.setAdminUser(userId, projectId, "grant"),
      permissionsRepo.setAdminUser(nonAdminUserId, projectId, "revoke"),
      accessTokensRepo.findOrCreateAccessToken(
        userId,
        CONENT_TYPES_API_ADMIN_TOKEN
      ),
      accessTokensRepo.findOrCreateAccessToken(
        nonAdminUserId,
        CONENT_TYPES_API_NON_ADMIN_TOKEN
      ),
    ])
  })

  afterAll(async () => {
    await accessTokensRepo.deactivateToken(CONENT_TYPES_API_ADMIN_TOKEN)
    await accessTokensRepo.deactivateToken(CONENT_TYPES_API_NON_ADMIN_TOKEN)

    await app.close()
    await mongoClient.close()
  })

  afterEach(async () => {
    await db.collection("contentTypes").deleteMany({})
  })

  describe("Needs Authentication", () => {
    test("GET /:projectId/content-types", async () => {
      await app.ready()

      await supertest(app.server).get(`/${projectId}/content-types`).expect(403)
    })

    test("GET /:projectId/content-types/:id", async () => {
      await app.ready()

      await supertest(app.server)
        .get(`/${projectId}/content-types/foobar`)
        .expect(403)
    })

    test("POST /:projectId/content-types", async () => {
      await app.ready()

      await supertest(app.server)
        .post(`/${projectId}/content-types`)
        .send({
          name: "foo",
          slug: "foo",
          type: "root",
          repeated: true,
          children: [],
        })
        .expect(403)
    })

    test("PATCH /:projectId/content-types/foobar", async () => {
      await app.ready()

      await supertest(app.server)
        .patch(`/${projectId}/content-types/foobar`)
        .send({
          hello: "world",
        })
        .expect(403)
    })

    test("DELETE /:projectId/content-types/foobar", async () => {
      await app.ready()

      await supertest(app.server)
        .delete(`/${projectId}/content-types/foobar`)
        .expect(403)
    })
  })

  describe("Only Admin users can create, update, delete and inspect content types", () => {
    describe("As Admin user", () => {
      test("GET /:projectId/content-types", async () => {
        await app.ready()

        supertest(app.server)
          .get(`/${projectId}/content-types`)
          .set("X-Access-Token", CONENT_TYPES_API_ADMIN_TOKEN)
          .expect(200)
      })

      test("POST /:projectId/content-types", async () => {
        await app.ready()

        const resp = await supertest(app.server)
          .post(`/${projectId}/content-types`)
          .send(compositeContentType("test01", projectId).getType())
          .set("X-Access-Token", CONENT_TYPES_API_ADMIN_TOKEN)
          .expect(201)

        expect(resp.body).not.toBeNull()
        expect(resp.body).toHaveProperty("_id")
        expect(resp.body).toHaveProperty("type")
        expect(resp.body).toHaveProperty("name")
        expect(resp.body).toHaveProperty("slug")
        expect(resp.body).toHaveProperty("children")
        expect(resp.body).toHaveProperty("repeated")

        const { _id, projectId: _projectId, ...body } = resp.body
        expect(body).toMatchSnapshot()

        expect(resp.headers["location"]).toMatch(
          new RegExp(`^\/${projectId}\/content-types\/(.+)$`)
        )
      })

      test("GET /:projectId/content-types/:idOrSlug", async () => {
        await app.ready()

        // Ensure entity exists
        const resp = await supertest(app.server)
          .post(`/${projectId}/content-types`)
          .send(compositeContentType("test01", projectId).getType())
          .set("X-Access-Token", CONENT_TYPES_API_ADMIN_TOKEN)
          .expect(201)

        expect(resp.body).toBeDefined()

        const resultFromSlug = await supertest(app.server)
          .get(`/${projectId}/content-types/${resp.body.slug}`)
          .set("X-Access-Token", CONENT_TYPES_API_ADMIN_TOKEN)
          .expect(200)

        const resultFromId = await supertest(app.server)
          .get(`/${projectId}/content-types/${resp.body._id}`)
          .set("X-Access-Token", CONENT_TYPES_API_ADMIN_TOKEN)
          .expect(200)

        expect(resultFromId.body._id).toBeDefined()
        expect(resultFromSlug.body._id).toBeDefined()
        expect(resultFromId.body._id).toBe(resultFromSlug.body._id)
      })

      test("PATCH /:projectId/content-types/:idOrSlug", async () => {
        await app.ready()

        // Ensure entity exists
        const resp = await supertest(app.server)
          .post(`/${projectId}/content-types`)
          .send(compositeContentType("test01", projectId).getType())
          .set("X-Access-Token", CONENT_TYPES_API_ADMIN_TOKEN)
          .expect(201)

        expect(resp.body).toBeDefined()

        await supertest(app.server)
          .patch(`/${projectId}/content-types/${resp.body.slug}`)
          .set("X-Access-Token", CONENT_TYPES_API_ADMIN_TOKEN)
          .send({
            name: "Hello World",
          })
          .expect(200)

        await supertest(app.server)
          .patch(`/${projectId}/content-types/${resp.body._id}`)
          .send({
            name: "Hello World 2",
          })
          .set("X-Access-Token", CONENT_TYPES_API_ADMIN_TOKEN)
          .expect(200)
      })

      test("DELETE /:projectId/content-types/:id", async () => {
        await app.ready()

        // Ensure entity exists
        const resp = await supertest(app.server)
          .post(`/${projectId}/content-types`)
          .send(compositeContentType("test01", projectId).getType())
          .set("X-Access-Token", CONENT_TYPES_API_ADMIN_TOKEN)
          .expect(201)

        expect(resp.body).toBeDefined()

        await supertest(app.server)
          .delete(`/${projectId}/content-types/${resp.body._id}`)
          .set("X-Access-Token", CONENT_TYPES_API_ADMIN_TOKEN)
          .expect(200)
      })

      test("DELETE /:projectId/content-types/:slug", async () => {
        await app.ready()

        // Ensure entity exists
        const resp = await supertest(app.server)
          .post(`/${projectId}/content-types`)
          .send(compositeContentType("test01", projectId).getType())
          .set("X-Access-Token", CONENT_TYPES_API_ADMIN_TOKEN)
          .expect(201)

        expect(resp.body).toBeDefined()

        await supertest(app.server)
          .delete(`/${projectId}/content-types/${resp.body.slug}`)
          .set("X-Access-Token", CONENT_TYPES_API_ADMIN_TOKEN)
          .expect(200)
      })
    })

    describe("As non-Admin user", () => {
      test("GET /:projectId/content-types", async () => {
        await app.ready()

        supertest(app.server)
          .get(`/${projectId}/content-types`)
          .set("X-Access-Token", CONENT_TYPES_API_NON_ADMIN_TOKEN)
          .expect(403)
      })

      test("POST /:projectId/content-types", async () => {
        await app.ready()

        const resp = await supertest(app.server)
          .post(`/${projectId}/content-types`)
          .send(compositeContentType("test01", projectId).getType())
          .set("X-Access-Token", CONENT_TYPES_API_NON_ADMIN_TOKEN)
          .expect(403)
      })

      test("GET /:projectId/content-types/:idOrSlug", async () => {
        await app.ready()

        // Ensure entity exists
        const resp = await supertest(app.server)
          .post(`/${projectId}/content-types`)
          .send(compositeContentType("test01", projectId).getType())
          .set("X-Access-Token", CONENT_TYPES_API_ADMIN_TOKEN)
          .expect(201)

        expect(resp.body).toBeDefined()

        await supertest(app.server)
          .get(`/${projectId}/content-types/${resp.body.slug}`)
          .set("X-Access-Token", CONENT_TYPES_API_NON_ADMIN_TOKEN)
          .expect(403)

        await supertest(app.server)
          .get(`/${projectId}/content-types/${resp.body._id}`)
          .set("X-Access-Token", CONENT_TYPES_API_NON_ADMIN_TOKEN)
          .expect(403)
      })

      test("PATCH /:projectId/content-types/:idOrSlug", async () => {
        await app.ready()

        // Ensure entity exists
        const resp = await supertest(app.server)
          .post(`/${projectId}/content-types`)
          .send(compositeContentType("test01", projectId).getType())
          .set("X-Access-Token", CONENT_TYPES_API_ADMIN_TOKEN)
          .expect(201)

        expect(resp.body).toBeDefined()

        await supertest(app.server)
          .patch(`/${projectId}/content-types/${resp.body.slug}`)
          .set("X-Access-Token", CONENT_TYPES_API_NON_ADMIN_TOKEN)
          .send({
            name: "Hello World",
          })
          .expect(403)

        await supertest(app.server)
          .patch(`/${projectId}/content-types/${resp.body._id}`)
          .send({
            name: "Hello World 2",
          })
          .set("X-Access-Token", CONENT_TYPES_API_NON_ADMIN_TOKEN)
          .expect(403)
      })

      test("DELETE /:projectId/content-types/:id", async () => {
        await app.ready()

        // Ensure entity exists
        const resp = await supertest(app.server)
          .post(`/${projectId}/content-types`)
          .send(compositeContentType("test01", projectId).getType())
          .set("X-Access-Token", CONENT_TYPES_API_ADMIN_TOKEN)
          .expect(201)

        expect(resp.body).toBeDefined()

        await supertest(app.server)
          .delete(`/${projectId}/content-types/${resp.body._id}`)
          .set("X-Access-Token", CONENT_TYPES_API_NON_ADMIN_TOKEN)
          .expect(403)
      })

      test("DELETE /:projectId/content-types/:slug", async () => {
        await app.ready()

        // Ensure entity exists
        const resp = await supertest(app.server)
          .post(`/${projectId}/content-types`)
          .send(compositeContentType("test01", projectId).getType())
          .set("X-Access-Token", CONENT_TYPES_API_ADMIN_TOKEN)
          .expect(201)

        expect(resp.body).toBeDefined()

        await supertest(app.server)
          .delete(`/${projectId}/content-types/${resp.body.slug}`)
          .set("X-Access-Token", CONENT_TYPES_API_NON_ADMIN_TOKEN)
          .expect(403)
      })
    })
  })
})
