import { describe, test, expect } from "@jest/globals"
import supertest from "supertest"
import app from "../../../../app"

describe("ContentTypes", () => {
  afterAll(() => {
    app.close()
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
          type: "document",
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
})
