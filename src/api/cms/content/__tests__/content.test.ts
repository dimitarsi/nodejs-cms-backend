import { describe } from "@jest/globals"
import { MongoClient } from "mongodb"
import supertest from "supertest"
import app from "../../../../app"
import { CreateContentPayload } from "~/models/content"

const createContent = (): CreateContentPayload => ({
  name: "foo",
  slug: "foo",
  isFolder: false,
  folderLocation: "/",
  folderTarget: "",
  children: [],
  data: null,
})

describe("Content", () => {
  const mongoClient = new MongoClient(
    process.env.MONGO_URL || "mongodb://root:example@localhost:27017"
  )
  const db = mongoClient.db(process.env.DB_NAME)

  afterAll(() => {
    app.close()
    mongoClient.close()
  })

  afterEach(async () => {
    await db.collection("contents").deleteMany({})
  })

  describe("Needs Authentication", () => {
    test("GET /contents", async () => {
      await app.ready()

      await supertest(app.server).get("/contents").expect(403)
    })

    test("GET /contents/:id", async () => {
      await app.ready()

      await supertest(app.server).get("/contents/foobar").expect(403)
    })

    test("POST /contents", async () => {
      await app.ready()

      await supertest(app.server)
        .post("/contents")
        .send(createContent())
        .expect(403)
    })

    test("PATCH /contents/foobar", async () => {
      await app.ready()

      await supertest(app.server)
        .patch("/contents/foobar")
        .send({
          hello: "world",
        })
        .expect(403)
    })

    test("DELETE /contents/foobar", async () => {
      await app.ready()

      await supertest(app.server).delete("/contents/foobar").expect(403)
    })
  })

  describe("Only Admin users can create, update, delete and inspect content types", () => {
    describe("As Admin user", () => {
      test("GET /contents", async () => {
        await app.ready()

        supertest(app.server)
          .get("/contents")
          .set("X-Access-Token", process.env.TEST_ADMIN_ACCESS_TOKEN!)
          .expect(200)
      })

      test("POST /contents", async () => {
        await app.ready()

        const data = createContent()

        expect(data.isFolder).toBeDefined()

        const resp = await supertest(app.server)
          .post("/contents")
          .send(createContent())
          .set("X-Access-Token", process.env.TEST_ADMIN_ACCESS_TOKEN!)
          .expect(201)

        expect(resp.body).toBeDefined()
        expect(resp.body).toHaveProperty("_id")
        // expect(resp.body).toHaveProperty("type")
        expect(resp.body).toHaveProperty("name")
        expect(resp.body).toHaveProperty("slug")
        expect(resp.body).toHaveProperty("isFolder")
        expect(resp.body).toHaveProperty("folderTarget")
        expect(resp.body).toHaveProperty("folderLocation")
        expect(resp.body).toHaveProperty("folderDepth")
        expect(resp.body.folderDepth).toBe(0)
        // expect(resp.body).toHaveProperty("data")

        const { _id, createdOn, updatedOn, ...body } = resp.body
        expect(body).toMatchSnapshot()

        expect(resp.headers["location"]).toMatch(/^\/contents\/(.+)$/)
      })

      test("GET /contents/:idOrSlug", async () => {
        await app.ready()

        // Ensure entity exists
        const resp = await supertest(app.server)
          .post("/contents")
          .send(createContent())
          .set("X-Access-Token", process.env.TEST_ADMIN_ACCESS_TOKEN!)
          .expect(201)

        expect(resp.body).toBeDefined()

        const resultFromSlug = await supertest(app.server)
          .get(`/contents/${resp.body.slug}`)
          .set("X-Access-Token", process.env.TEST_ADMIN_ACCESS_TOKEN!)
          .expect(200)

        const resultFromId = await supertest(app.server)
          .get(`/contents/${resp.body._id}`)
          .set("X-Access-Token", process.env.TEST_ADMIN_ACCESS_TOKEN!)
          .expect(200)

        expect(resultFromId.body._id).toBeDefined()
        expect(resultFromSlug.body._id).toBeDefined()
        expect(resultFromId.body._id).toBe(resultFromSlug.body._id)
      })

      test("PATCH /contents/:idOrSlug", async () => {
        await app.ready()

        // Ensure entity exists
        const resp = await supertest(app.server)
          .post("/contents")
          .send(createContent())
          .set("X-Access-Token", process.env.TEST_ADMIN_ACCESS_TOKEN!)
          .expect(201)

        expect(resp.body).toBeDefined()

        await supertest(app.server)
          .patch(`/contents/${resp.body.slug}`)
          .set("X-Access-Token", process.env.TEST_ADMIN_ACCESS_TOKEN!)
          .send({
            name: "Hello World",
          })
          .expect(200)

        await supertest(app.server)
          .patch(`/contents/${resp.body._id}`)
          .send({
            name: "Hello World 2",
          })
          .set("X-Access-Token", process.env.TEST_ADMIN_ACCESS_TOKEN!)
          .expect(200)
      })

      test("PATCH /contents/:idOrSlug - changing foder also updates the depth", async () => {
        await app.ready()

        const data = createContent()

        // Ensure entity exists
        const resp = await supertest(app.server)
          .post("/contents")
          .send(data)
          .set("X-Access-Token", process.env.TEST_ADMIN_ACCESS_TOKEN!)
          .expect(201)

        expect(resp.body).toBeDefined()
        expect(resp.body.folderDepth).toBe(0)

        const response = await supertest(app.server)
          .patch(`/contents/${resp.body.slug}`)
          .set("X-Access-Token", process.env.TEST_ADMIN_ACCESS_TOKEN!)
          .send({
            name: "Hello World",
            folderLocation: "/posts",
          })
          .expect(200)

        expect(response.body.folderDepth).toBe(1)
        expect(response.body.name).toBe("Hello World")
        expect(response.body.slug).toBe(data.slug)
      })

      test("DELETE /contents/:id", async () => {
        await app.ready()

        // Ensure entity exists
        const resp = await supertest(app.server)
          .post("/contents")
          .send(createContent())
          .set("X-Access-Token", process.env.TEST_ADMIN_ACCESS_TOKEN!)
          .expect(201)

        expect(resp.body).toBeDefined()

        await supertest(app.server)
          .delete(`/contents/${resp.body._id}`)
          .set("X-Access-Token", process.env.TEST_ADMIN_ACCESS_TOKEN!)
          .expect(200)
      })

      test("DELETE /contents/:slug", async () => {
        await app.ready()

        // Ensure entity exists
        const resp = await supertest(app.server)
          .post("/contents")
          .send(createContent())
          .set("X-Access-Token", process.env.TEST_ADMIN_ACCESS_TOKEN!)
          .expect(201)

        expect(resp.body).toBeDefined()

        await supertest(app.server)
          .delete(`/contents/${resp.body.slug}`)
          .set("X-Access-Token", process.env.TEST_ADMIN_ACCESS_TOKEN!)
          .expect(200)
      })
    })

    describe("As non-Admin user", () => {
      test("GET /contents", async () => {
        await app.ready()

        supertest(app.server)
          .get("/contents")
          .set("X-Access-Token", process.env.TEST_NON_ADMIN_ACCESS_TOKEN!)
          .expect(403)
      })

      test("POST /contents", async () => {
        await app.ready()

        const resp = await supertest(app.server)
          .post("/contents")
          .send(createContent())
          .set("X-Access-Token", process.env.TEST_NON_ADMIN_ACCESS_TOKEN!)
          .expect(403)
      })

      test("GET /contents/:idOrSlug", async () => {
        await app.ready()

        // Ensure entity exists
        const resp = await supertest(app.server)
          .post("/contents")
          .send(createContent())
          .set("X-Access-Token", process.env.TEST_ADMIN_ACCESS_TOKEN!)
          .expect(201)

        expect(resp.body).toBeDefined()

        await supertest(app.server)
          .get(`/contents/${resp.body.slug}`)
          .set("X-Access-Token", process.env.TEST_NON_ADMIN_ACCESS_TOKEN!)
          .expect(403)

        await supertest(app.server)
          .get(`/contents/${resp.body._id}`)
          .set("X-Access-Token", process.env.TEST_NON_ADMIN_ACCESS_TOKEN!)
          .expect(403)
      })

      test("PATCH /contents/:idOrSlug", async () => {
        await app.ready()

        // Ensure entity exists
        const resp = await supertest(app.server)
          .post("/contents")
          .send(createContent())
          .set("X-Access-Token", process.env.TEST_ADMIN_ACCESS_TOKEN!)
          .expect(201)

        expect(resp.body).toBeDefined()

        await supertest(app.server)
          .patch(`/contents/${resp.body.slug}`)
          .set("X-Access-Token", process.env.TEST_NON_ADMIN_ACCESS_TOKEN!)
          .send({
            name: "Hello World",
          })
          .expect(403)

        await supertest(app.server)
          .patch(`/contents/${resp.body._id}`)
          .send({
            name: "Hello World 2",
          })
          .set("X-Access-Token", process.env.TEST_NON_ADMIN_ACCESS_TOKEN!)
          .expect(403)
      })

      test("DELETE /contents/:id", async () => {
        await app.ready()

        // Ensure entity exists
        const resp = await supertest(app.server)
          .post("/contents")
          .send(createContent())
          .set("X-Access-Token", process.env.TEST_ADMIN_ACCESS_TOKEN!)
          .expect(201)

        expect(resp.body).toBeDefined()

        await supertest(app.server)
          .delete(`/contents/${resp.body._id}`)
          .set("X-Access-Token", process.env.TEST_NON_ADMIN_ACCESS_TOKEN!)
          .expect(403)
      })

      test("DELETE /contents/:slug", async () => {
        await app.ready()

        // Ensure entity exists
        const resp = await supertest(app.server)
          .post("/contents")
          .send(createContent())
          .set("X-Access-Token", process.env.TEST_ADMIN_ACCESS_TOKEN!)
          .expect(201)

        expect(resp.body).toBeDefined()

        await supertest(app.server)
          .delete(`/contents/${resp.body.slug}`)
          .set("X-Access-Token", process.env.TEST_NON_ADMIN_ACCESS_TOKEN!)
          .expect(403)
      })
    })
  })

  describe("Quering content types", () => {
    test("find content by folder - `/contents?folder=/posts`", async () => {
      await app.ready()

      const data = createContent()
      const dataInFolder = createContent()

      await supertest(app.server)
        .post("/contents")
        .send(data)
        .set("X-Access-Token", process.env.TEST_ADMIN_ACCESS_TOKEN!)
        .expect(201)

      dataInFolder.slug = "test-folder-query"
      dataInFolder.folderLocation = "/posts"
      // dataInFolder.folderDepth = 2

      await supertest(app.server)
        .post("/contents")
        .send(dataInFolder)
        .set("X-Access-Token", process.env.TEST_ADMIN_ACCESS_TOKEN!)
        .expect(201)

      await supertest(app.server)
        .get(`/contents/${dataInFolder.slug}`)
        .set("X-Access-Token", process.env.TEST_ADMIN_ACCESS_TOKEN!)
        .expect(200)

      const response = await supertest(app.server)
        .get(`/contents?folder=/posts`)
        .set("X-Access-Token", process.env.TEST_ADMIN_ACCESS_TOKEN!)
        .expect(200)

      expect(response.body.items).toHaveLength(1)
      expect(response.body.pagination.count).toBe(1)
      expect(response.body.items[0].slug).toBe(dataInFolder.slug)
      expect(response.body.items[0].folderDepth).toBe(1)
    })
  })
})
