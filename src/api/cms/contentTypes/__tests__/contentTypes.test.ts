import { MongoClient, type WithId } from "mongodb"
import { compositeContentType } from "./../../../../models/contentType"
import { describe, test, expect } from "@jest/globals"
import supertest from "supertest"
import app from "../../../../app"
import users from "~/repo/users"
import accessTokens from "~/repo/accessTokens"
import seedUsers from "~/cli/seed/users"
import { User } from "~/models/user"

describe("ContentTypes", () => {
  const mongoClient = new MongoClient(
    process.env.MONGO_URL || "mongodb://root:example@localhost:27017"
  )
  const db = mongoClient.db(process.env.DB_NAME)

  afterAll(() => {
    app.close()
    mongoClient.close()
  })

  afterEach(async () => {
    await db.collection("contentTypes").deleteMany({})
  })

  describe("Needs Authentication", () => {
    test("GET /content-types", async () => {
      await app.ready()

      await supertest(app.server).get("/content-types").expect(403)
    })

    test("GET /content-types/:id", async () => {
      await app.ready()

      await supertest(app.server).get("/content-types/foobar").expect(403)
    })

    test("POST /content-types", async () => {
      await app.ready()

      await supertest(app.server)
        .post("/content-types")
        .send({
          name: "foo",
          slug: "foo",
          type: "root",
          repeated: true,
          children: [],
        })
        .expect(403)
    })

    test("PATCH /content-types/foobar", async () => {
      await app.ready()

      await supertest(app.server)
        .patch("/content-types/foobar")
        .send({
          hello: "world",
        })
        .expect(403)
    })

    test("DELETE /content-types/foobar", async () => {
      await app.ready()

      await supertest(app.server).delete("/content-types/foobar").expect(403)
    })
  })

  describe("Only Admin users can create, update, delete and inspect content types", () => {
    const usersRepo = users(db)
    const accessTokensRepo = accessTokens(db)

    beforeEach(async () => {
      await usersRepo.deleteAll()
      await accessTokensRepo.deleteAll()

      await seedUsers(db)
      const user = (await usersRepo
        .getCollection()
        .findOne({ isAdmin: true })) as WithId<User>

      await accessTokensRepo.findOrCreateAccessToken(
        user._id,
        { isAdmin: true },
        process.env.TEST_ADMIN_ACCESS_TOKEN
      )
    })

    describe("As Admin user", () => {
      test("GET /content-types", async () => {
        await app.ready()

        supertest(app.server)
          .get("/content-types")
          .set("X-Access-Token", process.env.TEST_ADMIN_ACCESS_TOKEN!)
          .expect(200)
      })

      test("POST /content-types", async () => {
        await app.ready()

        const resp = await supertest(app.server)
          .post("/content-types")
          .send(compositeContentType("test01").getType())
          .set("X-Access-Token", process.env.TEST_ADMIN_ACCESS_TOKEN!)
          .expect(201)

        expect(resp.body).toBeDefined()
        expect(resp.body).toHaveProperty("_id")
        expect(resp.body).toHaveProperty("type")
        expect(resp.body).toHaveProperty("name")
        expect(resp.body).toHaveProperty("slug")
        expect(resp.body).toHaveProperty("children")
        expect(resp.body).toHaveProperty("repeated")

        const { _id, ...body } = resp.body
        expect(body).toMatchSnapshot()

        expect(resp.headers["location"]).toMatch(/^\/content-types\/(.+)$/)
      })

      test("GET /content-types/:idOrSlug", async () => {
        await app.ready()

        // Ensure entity exists
        const resp = await supertest(app.server)
          .post("/content-types")
          .send(compositeContentType("test01").getType())
          .set("X-Access-Token", process.env.TEST_ADMIN_ACCESS_TOKEN!)
          .expect(201)

        expect(resp.body).toBeDefined()

        const resultFromSlug = await supertest(app.server)
          .get(`/content-types/${resp.body.slug}`)
          .set("X-Access-Token", process.env.TEST_ADMIN_ACCESS_TOKEN!)
          .expect(200)

        const resultFromId = await supertest(app.server)
          .get(`/content-types/${resp.body._id}`)
          .set("X-Access-Token", process.env.TEST_ADMIN_ACCESS_TOKEN!)
          .expect(200)

        expect(resultFromId.body._id).toBeDefined()
        expect(resultFromSlug.body._id).toBeDefined()
        expect(resultFromId.body._id).toBe(resultFromSlug.body._id)
      })

      test("PATCH /content-types/:idOrSlug", async () => {
        await app.ready()

        // Ensure entity exists
        const resp = await supertest(app.server)
          .post("/content-types")
          .send(compositeContentType("test01").getType())
          .set("X-Access-Token", process.env.TEST_ADMIN_ACCESS_TOKEN!)
          .expect(201)

        expect(resp.body).toBeDefined()

        await supertest(app.server)
          .patch(`/content-types/${resp.body.slug}`)
          .set("X-Access-Token", process.env.TEST_ADMIN_ACCESS_TOKEN!)
          .send({
            name: "Hello World",
          })
          .expect(200)

        await supertest(app.server)
          .patch(`/content-types/${resp.body._id}`)
          .send({
            name: "Hello World 2",
          })
          .set("X-Access-Token", process.env.TEST_ADMIN_ACCESS_TOKEN!)
          .expect(200)
      })

      test("DELETE /content-types/:id", async () => {
        await app.ready()

        // Ensure entity exists
        const resp = await supertest(app.server)
          .post("/content-types")
          .send(compositeContentType("test01").getType())
          .set("X-Access-Token", process.env.TEST_ADMIN_ACCESS_TOKEN!)
          .expect(201)

        expect(resp.body).toBeDefined()

        await supertest(app.server)
          .delete(`/content-types/${resp.body._id}`)
          .set("X-Access-Token", process.env.TEST_ADMIN_ACCESS_TOKEN!)
          .expect(200)
      })

      test("DELETE /content-types/:slug", async () => {
        await app.ready()

        // Ensure entity exists
        const resp = await supertest(app.server)
          .post("/content-types")
          .send(compositeContentType("test01").getType())
          .set("X-Access-Token", process.env.TEST_ADMIN_ACCESS_TOKEN!)
          .expect(201)

        expect(resp.body).toBeDefined()

        await supertest(app.server)
          .delete(`/content-types/${resp.body.slug}`)
          .set("X-Access-Token", process.env.TEST_ADMIN_ACCESS_TOKEN!)
          .expect(200)
      })
    })

    describe("As non-Admin user", () => {
      test("GET /content-types", async () => {
        await app.ready()

        supertest(app.server)
          .get("/content-types")
          .set("X-Access-Token", process.env.TEST_NON_ADMIN_ACCESS_TOKEN!)
          .expect(403)
      })

      test("POST /content-types", async () => {
        await app.ready()

        const resp = await supertest(app.server)
          .post("/content-types")
          .send(compositeContentType("test01").getType())
          .set("X-Access-Token", process.env.TEST_NON_ADMIN_ACCESS_TOKEN!)
          .expect(403)
      })

      test("GET /content-types/:idOrSlug", async () => {
        await app.ready()

        // Ensure entity exists
        const resp = await supertest(app.server)
          .post("/content-types")
          .send(compositeContentType("test01").getType())
          .set("X-Access-Token", process.env.TEST_ADMIN_ACCESS_TOKEN!)
          .expect(201)

        expect(resp.body).toBeDefined()

        await supertest(app.server)
          .get(`/content-types/${resp.body.slug}`)
          .set("X-Access-Token", process.env.TEST_NON_ADMIN_ACCESS_TOKEN!)
          .expect(403)

        await supertest(app.server)
          .get(`/content-types/${resp.body._id}`)
          .set("X-Access-Token", process.env.TEST_NON_ADMIN_ACCESS_TOKEN!)
          .expect(403)
      })

      test("PATCH /content-types/:idOrSlug", async () => {
        await app.ready()

        // Ensure entity exists
        const resp = await supertest(app.server)
          .post("/content-types")
          .send(compositeContentType("test01").getType())
          .set("X-Access-Token", process.env.TEST_ADMIN_ACCESS_TOKEN!)
          .expect(201)

        expect(resp.body).toBeDefined()

        await supertest(app.server)
          .patch(`/content-types/${resp.body.slug}`)
          .set("X-Access-Token", process.env.TEST_NON_ADMIN_ACCESS_TOKEN!)
          .send({
            name: "Hello World",
          })
          .expect(403)

        await supertest(app.server)
          .patch(`/content-types/${resp.body._id}`)
          .send({
            name: "Hello World 2",
          })
          .set("X-Access-Token", process.env.TEST_NON_ADMIN_ACCESS_TOKEN!)
          .expect(403)
      })

      test("DELETE /content-types/:id", async () => {
        await app.ready()

        // Ensure entity exists
        const resp = await supertest(app.server)
          .post("/content-types")
          .send(compositeContentType("test01").getType())
          .set("X-Access-Token", process.env.TEST_ADMIN_ACCESS_TOKEN!)
          .expect(201)

        expect(resp.body).toBeDefined()

        await supertest(app.server)
          .delete(`/content-types/${resp.body._id}`)
          .set("X-Access-Token", process.env.TEST_NON_ADMIN_ACCESS_TOKEN!)
          .expect(403)
      })

      test("DELETE /content-types/:slug", async () => {
        await app.ready()

        // Ensure entity exists
        const resp = await supertest(app.server)
          .post("/content-types")
          .send(compositeContentType("test01").getType())
          .set("X-Access-Token", process.env.TEST_ADMIN_ACCESS_TOKEN!)
          .expect(201)

        expect(resp.body).toBeDefined()

        await supertest(app.server)
          .delete(`/content-types/${resp.body.slug}`)
          .set("X-Access-Token", process.env.TEST_NON_ADMIN_ACCESS_TOKEN!)
          .expect(403)
      })
    })
  })
})
