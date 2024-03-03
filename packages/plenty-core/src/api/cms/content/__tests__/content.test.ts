import { describe, test, beforeAll, afterAll, afterEach, expect } from "vitest"
import { MongoClient, ObjectId } from "mongodb"
import supertest from "supertest"
import app from "~/app"
import { CreateContentPayload } from "~/models/content"
import accessTokens from "~/repo/accessTokens"
import permissions from "~/repo/permissions"

const createContent = (): CreateContentPayload => ({
  name: "foo",
  slug: "foo",
  isFolder: false,
  folderLocation: "/",
  folderTarget: "",
  children: [],
  data: null,
  projectId: new ObjectId(),
})

describe("Content", async () => {
  const mongoClient = new MongoClient(
    process.env.MONGO_URL || "mongodb://root:example@localhost:27017"
  )
  const db = await mongoClient.db(process.env.DB_NAME)
  const accessTokensRepo = accessTokens(db)
  const permissionsRepo = permissions(db)
  const projectId = new ObjectId().toString()
  const adminUserId = new ObjectId()
  const nonAdminUserId = new ObjectId()

  const CONTENT_API_ADMIN_TOKEN = "content-API-admin-token"
  const CONENT_API_NON_ADMIN_TOKEN = "content-API-non-admin-token"

  // Seed tokens
  beforeAll(async () => {
    await Promise.all([
      accessTokensRepo.findOrCreateAccessToken(
        adminUserId,
        CONTENT_API_ADMIN_TOKEN
      ),
      accessTokensRepo.findOrCreateAccessToken(
        nonAdminUserId,
        CONENT_API_NON_ADMIN_TOKEN
      ),
      permissionsRepo.setAdminUser(adminUserId, projectId, "grant"),
      permissionsRepo.setAdminUser(nonAdminUserId, projectId, "revoke"),
    ])
  })

  afterAll(async () => {
    await accessTokensRepo.deactivateToken(CONTENT_API_ADMIN_TOKEN)
    await accessTokensRepo.deactivateToken(CONENT_API_NON_ADMIN_TOKEN)

    await app.close()
    await mongoClient.close()
  })

  afterEach(async () => {
    await db.collection("contents").deleteMany({})
  })

  describe("Needs Authentication", () => {
    test("GET /:projectId/contents", async () => {
      await app.ready()

      await supertest(app.server).get(`/${projectId}/contents`).expect(403)
    })

    test("GET /:projectId/contents/:id", async () => {
      await app.ready()

      await supertest(app.server)
        .get(`/${projectId}/contents/foobar`)
        .expect(403)
    })

    test("POST /projectId/contents", async () => {
      await app.ready()

      await supertest(app.server)
        .post(`/${projectId}/contents`)
        .send(createContent())
        .expect(403)
    })

    test("PATCH /:projectId/contents/foobar", async () => {
      await app.ready()

      await supertest(app.server)
        .patch(`/${projectId}/contents/foobar`)
        .send({
          hello: "world",
        })
        .expect(403)
    })

    test("DELETE /:projetId/contents/foobar", async () => {
      await app.ready()

      await supertest(app.server)
        .delete(`/${projectId}/contents/foobar`)
        .expect(403)
    })
  })

  describe("Only Admin users can create, update, delete and inspect content types", () => {
    describe("As Admin user", () => {
      test("GET /:projectId/contents", async () => {
        await app.ready()

        supertest(app.server)
          .get(`/${projectId}/contents`)
          .set("X-Access-Token", CONTENT_API_ADMIN_TOKEN)
          .expect(200)
      })

      test("POST /:projectId/contents", async () => {
        await app.ready()

        const data = createContent()

        expect(data.isFolder).toBeDefined()

        const resp = await supertest(app.server)
          .post(`/${projectId}/contents`)
          .send(createContent())
          .set("X-Access-Token", CONTENT_API_ADMIN_TOKEN)
          .expect(201)

        expect(resp.body).toBeDefined()
        expect(resp.body).toHaveProperty("_id")
        expect(resp.body).toHaveProperty("name")
        expect(resp.body).toHaveProperty("slug")
        expect(resp.body).toHaveProperty("isFolder")
        expect(resp.body).toHaveProperty("folderTarget")
        expect(resp.body).toHaveProperty("folderLocation")
        expect(resp.body).toHaveProperty("folderDepth")
        expect(resp.body).toHaveProperty("children")
        expect(resp.body.folderDepth).toBe(0)
        expect(resp.body).toHaveProperty("data")

        const { _id, createdOn, updatedOn, ...body } = resp.body
        const { projectId: bodyProjectId, ...bodyNoProjectId } = body

        expect(bodyProjectId).toBeTruthy()
        expect(bodyNoProjectId).toMatchSnapshot()

        expect(resp.headers["location"]).toMatch(
          new RegExp(`^\/${projectId}\/contents\/(.+)$`)
        )
      })

      test("GET /:projectId/contents/:idOrSlug", async () => {
        await app.ready()

        // Ensure entity exists
        const resp = await supertest(app.server)
          .post(`/${projectId}/contents`)
          .send(createContent())
          .set("X-Access-Token", CONTENT_API_ADMIN_TOKEN)
          .expect(201)

        expect(resp.body).toBeDefined()

        const resultFromSlug = await supertest(app.server)
          .get(`/${projectId}/contents/${resp.body.slug}`)
          .set("X-Access-Token", CONTENT_API_ADMIN_TOKEN)
          .expect(200)

        const resultFromId = await supertest(app.server)
          .get(`/${projectId}/contents/${resp.body._id}`)
          .set("X-Access-Token", CONTENT_API_ADMIN_TOKEN)
          .expect(200)

        expect(resultFromId.body._id).toBeDefined()
        expect(resultFromSlug.body._id).toBeDefined()
        expect(resultFromSlug.body).toHaveProperty("children")
        expect(resultFromId.body._id).toBe(resultFromSlug.body._id)
      })

      test("PATCH /:projectId/contents/:idOrSlug", async () => {
        await app.ready()

        // Ensure entity exists
        const resp = await supertest(app.server)
          .post(`/${projectId}/contents`)
          .send(createContent())
          .set("X-Access-Token", CONTENT_API_ADMIN_TOKEN)
          .expect(201)

        expect(resp.body).toBeDefined()

        await supertest(app.server)
          .patch(`/${projectId}/contents/${resp.body.slug}`)
          .set("X-Access-Token", CONTENT_API_ADMIN_TOKEN)
          .send({
            name: "Hello World",
          })
          .expect(200)

        await supertest(app.server)
          .patch(`/${projectId}/contents/${resp.body._id}`)
          .send({
            name: "Hello World 2",
          })
          .set("X-Access-Token", CONTENT_API_ADMIN_TOKEN)
          .expect(200)
      })

      test("PATCH /:projectId/contents/:idOrSlug - changing folder also updates the depth", async () => {
        await app.ready()

        const data = createContent()

        // Ensure entity exists
        const resp = await supertest(app.server)
          .post(`/${projectId}/contents`)
          .send(data)
          .set("X-Access-Token", CONTENT_API_ADMIN_TOKEN)
          .expect(201)

        expect(resp.body).toBeDefined()
        expect(resp.body.folderDepth).toBe(0)

        const response = await supertest(app.server)
          .patch(`/${projectId}/contents/${resp.body.slug}`)
          .set("X-Access-Token", CONTENT_API_ADMIN_TOKEN)
          .send({
            name: "Hello World",
            folderLocation: "/posts",
          })
          .expect(200)

        expect(response.body.folderDepth).toBe(1)
        expect(response.body.name).toBe("Hello World")
        expect(response.body.slug).toBe(data.slug)
      })

      test("DELETE /:projectId/contents/:id", async () => {
        await app.ready()

        // Ensure entity exists
        const resp = await supertest(app.server)
          .post(`/${projectId}/contents`)
          .send(createContent())
          .set("X-Access-Token", CONTENT_API_ADMIN_TOKEN)
          .expect(201)

        expect(resp.body).toBeDefined()

        await supertest(app.server)
          .delete(`/${projectId}/contents/${resp.body._id}`)
          .set("X-Access-Token", CONTENT_API_ADMIN_TOKEN)
          .expect(200)
      })

      test("DELETE /:projectId/contents/:slug", async () => {
        await app.ready()

        // Ensure entity exists
        const resp = await supertest(app.server)
          .post(`/${projectId}/contents`)
          .send(createContent())
          .set("X-Access-Token", CONTENT_API_ADMIN_TOKEN)
          .expect(201)

        expect(resp.body).toBeDefined()

        await supertest(app.server)
          .delete(`/${projectId}/contents/${resp.body.slug}`)
          .set("X-Access-Token", CONTENT_API_ADMIN_TOKEN)
          .expect(200)
      })
    })

    describe("As non-Admin user", () => {
      test("GET /:projectId/contents", async () => {
        await app.ready()

        supertest(app.server)
          .get(`/${projectId}/contents`)
          .set("X-Access-Token", CONENT_API_NON_ADMIN_TOKEN)
          .expect(403)
      })

      test("POST /:projectId/contents", async () => {
        await app.ready()

        const resp = await supertest(app.server)
          .post(`/${projectId}/contents`)
          .send(createContent())
          .set("X-Access-Token", CONENT_API_NON_ADMIN_TOKEN)
          .expect(403)
      })

      test("GET /:projectId/contents/:idOrSlug", async () => {
        await app.ready()

        // Ensure entity exists
        const resp = await supertest(app.server)
          .post(`/${projectId}/contents`)
          .send(createContent())
          .set("X-Access-Token", CONTENT_API_ADMIN_TOKEN)
          .expect(201)

        expect(resp.body).toBeDefined()

        await supertest(app.server)
          .get(`/${projectId}/contents/${resp.body.slug}`)
          .set("X-Access-Token", CONENT_API_NON_ADMIN_TOKEN)
          .expect(403)

        await supertest(app.server)
          .get(`/${projectId}/contents/${resp.body._id}`)
          .set("X-Access-Token", CONENT_API_NON_ADMIN_TOKEN)
          .expect(403)
      })

      test("PATCH /:projectId/contents/:idOrSlug", async () => {
        await app.ready()

        // Ensure entity exists
        const resp = await supertest(app.server)
          .post(`/${projectId}/contents`)
          .send(createContent())
          .set("X-Access-Token", CONTENT_API_ADMIN_TOKEN)
          .expect(201)

        expect(resp.body).toBeDefined()

        await supertest(app.server)
          .patch(`/${projectId}/contents/${resp.body.slug}`)
          .set("X-Access-Token", CONENT_API_NON_ADMIN_TOKEN)
          .send({
            name: "Hello World",
          })
          .expect(403)

        await supertest(app.server)
          .patch(`/${projectId}/contents/${resp.body._id}`)
          .send({
            name: "Hello World 2",
          })
          .set("X-Access-Token", CONENT_API_NON_ADMIN_TOKEN)
          .expect(403)
      })

      test("DELETE /:projectId/contents/:id", async () => {
        await app.ready()

        // Ensure entity exists
        const resp = await supertest(app.server)
          .post(`/${projectId}/contents`)
          .send(createContent())
          .set("X-Access-Token", CONTENT_API_ADMIN_TOKEN)
          .expect(201)

        expect(resp.body).toBeDefined()

        await supertest(app.server)
          .delete(`/${projectId}/contents/${resp.body._id}`)
          .set("X-Access-Token", CONENT_API_NON_ADMIN_TOKEN)
          .expect(403)
      })

      test("DELETE /:projectId/contents/:slug", async () => {
        await app.ready()

        // Ensure entity exists
        const resp = await supertest(app.server)
          .post(`/${projectId}/contents`)
          .send(createContent())
          .set("X-Access-Token", CONTENT_API_ADMIN_TOKEN)
          .expect(201)

        expect(resp.body).toBeDefined()

        await supertest(app.server)
          .delete(`/${projectId}/contents/${resp.body.slug}`)
          .set("X-Access-Token", CONENT_API_NON_ADMIN_TOKEN)
          .expect(403)
      })
    })
  })

  describe("Quering content types", () => {
    test("find content by folder - `/:projectId/contents?folder=/posts`", async () => {
      await app.ready()

      const data = createContent()
      const dataInFolder = createContent()

      await supertest(app.server)
        .post(`/${projectId}/contents`)
        .send(data)
        .set("X-Access-Token", CONTENT_API_ADMIN_TOKEN)
        .expect(201)

      dataInFolder.slug = "test-folder-query"
      dataInFolder.folderLocation = "/posts"
      // dataInFolder.folderDepth = 2

      await supertest(app.server)
        .post(`/${projectId}/contents`)
        .send(dataInFolder)
        .set("X-Access-Token", CONTENT_API_ADMIN_TOKEN)
        .expect(201)

      await supertest(app.server)
        .get(`/${projectId}/contents/${dataInFolder.slug}`)
        .set("X-Access-Token", CONTENT_API_ADMIN_TOKEN)
        .expect(200)

      const response = await supertest(app.server)
        .get(`/${projectId}/contents?folder=/posts`)
        .set("X-Access-Token", CONTENT_API_ADMIN_TOKEN)
        .expect(200)

      expect(response.body.items).toHaveLength(1)
      expect(response.body.pagination.count).toBe(1)
      expect(response.body.items[0].slug).toBe(dataInFolder.slug)
      expect(response.body.items[0].folderDepth).toBe(1)
    })
  })
})
