import { describe } from "@jest/globals"
import { MongoClient } from "mongodb"
import supertest from "supertest"
import app from "../../../../app"

const createContent = () => ({
  name: "foo",
  slug: "foo",
  type: "document",
  folderLocation: "/",
  folderTarget: "/",
  depth: 1,
  configId: "",
  data: {},
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
        .send({
          name: "content",
          slug: "content",
          type: "document",
          folderLocation: "/",
          folderTarget: "/",
          depth: 1,
          configId: "fake-config-id",
          data: {},
        })
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

        const resp = await supertest(app.server)
          .post("/contents")
          .send(createContent())
          .set("X-Access-Token", process.env.TEST_ADMIN_ACCESS_TOKEN!)
          .expect(201)

        expect(resp.body).toBeDefined()
        expect(resp.body).toHaveProperty("_id")
        expect(resp.body).toHaveProperty("type")
        expect(resp.body).toHaveProperty("name")
        expect(resp.body).toHaveProperty("slug")
        expect(resp.body).toHaveProperty("data")

        const { _id, ...body } = resp.body
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
})
