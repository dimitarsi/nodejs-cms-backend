import { describe, expect, test } from "@jest/globals"

import repo from "../contentTypes"
import db, { closeMongoClient, connectMongoClient } from "@db"

import { compositeContentType, textContentType } from "~/models/contentType"

describe("ContentTypes Repo", () => {
  beforeAll(async () => {
    await connectMongoClient()
  })

  afterEach(async () => {
    await db.dropDatabase()
  })

  afterAll(async () => {
    await closeMongoClient()
  })

  test("Can create and find simple content Types", async () => {
    await repo.create(textContentType("Title"))

    const item = await repo.getById("title")

    expect(item.type).toBe("text")
    expect(item.name).toBe("Title")
    expect(item._id).toBeDefined()
  })

  describe("Nested references", () => {
    const post = compositeContentType("Post", true)
    const seo = compositeContentType("SEO", true)

    seo
      .add(textContentType("title"))
      .add(textContentType("description"))
      .add(textContentType("image"))

    beforeEach(async () => {
      await repo.create(seo.getType())

      const seoItem = await repo.getById("seo")

      post.add(seoItem)  

      await repo.create(post.getType())
    })

    afterEach(async () => {
      await repo.deleteAll()
      post.clearChildren()
    })

    test("Can create and find root references", async () => {
      const postItem = await repo.getById("post")

      expect(postItem.type).toBe("root")
      expect(postItem.children).toHaveLength(1)
      expect(postItem.children?.[0]).toHaveProperty("type")
      expect(postItem.children?.[0]).toHaveProperty("name")
      expect(postItem.children?.[0]).toHaveProperty("slug")
      expect(postItem.children?.[0]).toHaveProperty("children")
      expect(postItem.children?.[0]).toHaveProperty("_id")
      expect(postItem.children?.[0].type).toBe("root")
      expect(postItem.children?.[0].name).toBe("SEO")
      expect(postItem.children?.[0].children).toHaveLength(
        seo.getType().children!.length
      )
    })

    test("Updating a referred (root) field also updates the reference", async () => {
      seo.add(textContentType("schemaType"))

      await repo.update("seo", seo.getType())

      const postItem = await repo.getById("post")

      expect(postItem.type).toBe("root")
      expect(postItem.children).toHaveLength(1)
      expect(postItem.children?.[0]).toHaveProperty("type")
      expect(postItem.children?.[0]).toHaveProperty("name")
      expect(postItem.children?.[0]).toHaveProperty("slug")
      expect(postItem.children?.[0]).toHaveProperty("children")
      expect(postItem.children?.[0]).toHaveProperty("_id")
      expect(postItem.children?.[0].type).toBe("root")
      expect(postItem.children?.[0].name).toBe("SEO")
      expect(postItem.children?.[0].children).toHaveLength(
        seo.getType().children!.length
      )
    })
  })
})
