import { describe, expect, test } from "@jest/globals"

import repo from "../contentTypes"
import db, { closeMongoClient, connectMongoClient } from "@db"

import {
  ContentType,
  compositeContentType,
  createContentType,
} from "~/models/contentType"

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

  test.failing("Tests can fail", () => {
    expect(false).toBeTruthy()
  })

  test("Can create and find simple content Types", async () => {
    await repo.create(createContentType("Title"))

    const item = await repo.getById("title")

    expect(item).toBeDefined()

    expect(item!.type).toBe("text")
    expect(item!.name).toBe("Title")
    expect(item!._id).toBeDefined()
  })

  describe("Nested references", () => {
    const post = compositeContentType("Post", true)
    const seo = compositeContentType("SEO", true)

    seo
      .add(createContentType("title"))
      .add(createContentType("description"))
      .add(createContentType("image"))

    beforeEach(async () => {
      await repo.create(seo.getType())

      const seoItem = await repo.getById("seo")

      if (seoItem) {
        post.add(seoItem)

        await repo.create(post.getType())
      }
    })

    afterEach(async () => {
      await repo.deleteAll()
      post.clearChildren()
    })

    test("Can create and find root references", async () => {
      const postItem = await repo.getById("post")

      expect(postItem).not.toBeNull()

      expect(postItem!.type).toBe("root")
      expect(postItem!.children).toHaveLength(1)
      expect(postItem!.children?.[0]).toHaveProperty("type")
      expect(postItem!.children?.[0]).toHaveProperty("name")
      expect(postItem!.children?.[0]).toHaveProperty("slug")
      expect(postItem!.children?.[0]).toHaveProperty("children")
      expect(postItem!.children?.[0]).toHaveProperty("_id")
      expect(postItem!.children?.[0].type).toBe("root")
      expect(postItem!.children?.[0].name).toBe("SEO")
      expect(postItem!.children?.[0].children).toHaveLength(
        seo.getType().children!.length
      )
    })

    test("Updating a referred (root) field also updates the reference", async () => {
      seo.add(createContentType("schemaType"))

      await repo.update("seo", seo.getType())

      const postItem = await repo.getById("post")

      expect(postItem).toBeDefined()
      expect(postItem!.type).toBe("root")
      expect(postItem!.children).toHaveLength(1)
      expect(postItem!.children?.[0]).toHaveProperty("type")
      expect(postItem!.children?.[0]).toHaveProperty("name")
      expect(postItem!.children?.[0]).toHaveProperty("slug")
      expect(postItem!.children?.[0]).toHaveProperty("children")
      expect(postItem!.children?.[0]).toHaveProperty("_id")
      expect(postItem!.children?.[0].type).toBe("root")
      expect(postItem!.children?.[0].name).toBe("SEO")
      expect(postItem!.children?.[0].children).toHaveLength(
        seo.getType().children!.length
      )
    })

    test.only("Preserving original contentType name when root contentType", async () => {
      const root = compositeContentType("root", true)
      const innerRoot = compositeContentType("innerRoot", true)

      await repo.create(innerRoot.getType())

      const innerRootInstance = await repo.getById("inner_root")

      expect(innerRootInstance).toBeDefined()
      expect(innerRootInstance!._id).toBeDefined()

      const renamedInnerRoot: ContentType = {
        _id: innerRootInstance!._id,
        name: "postInnerRoot",
        slug: "postInnerRoot",
        type: "root",
        children: [],
        repeated: null,
      }

      root.add(renamedInnerRoot)

      await repo.create(root.getType())

      const rootInstance = await repo.getById("root")

      expect(rootInstance).toBeDefined()
      expect(rootInstance!._id).toBeDefined()
      expect(rootInstance).not.toHaveProperty("originalName")
      expect(rootInstance).not.toHaveProperty("originalSlug")
      expect(rootInstance!.children).toHaveLength(1)
      expect(rootInstance!.children?.[0].type).toBe("root")
      expect(rootInstance!.children?.[0]).toHaveProperty("originalName")
      expect(rootInstance!.children?.[0]).toHaveProperty("originalSlug")
      expect(rootInstance!.children?.[0].name).toBe("postInnerRoot")
      expect(rootInstance!.children?.[0].slug).toBe("postInnerRoot")
      expect(rootInstance!.children?.[0].originalName).toBe("innerRoot")
      expect(rootInstance!.children?.[0].originalSlug).toBe("inner_root")
    })
  })
})
