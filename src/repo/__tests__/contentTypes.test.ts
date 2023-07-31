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

  test("Creating a contentType always has 'root' type", () => {
    expect(false).toBeTruthy();
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

    test("Preserving original contentType name when root contentType", async () => {
      const root = compositeContentType("root", true);
      const innerRoot = compositeContentType("innerRoot", true);

      await repo.create(innerRoot.getType());

      const innerRootInstance = await repo.getById("inner_root");

      expect(innerRootInstance._id).toBeDefined()

      const renamedInnerRoot = {_id: innerRootInstance._id, name: "postInnerRoot", slug: "postInnerRoot", type: "root", children: [] }
      root.add(renamedInnerRoot);

      await repo.create(root.getType());

      const rootInstance = await repo.getById("root")

      expect(rootInstance._id).toBeDefined()
      expect(rootInstance).not.toHaveProperty('originalName')
      expect(rootInstance).not.toHaveProperty('originalSlug')
      expect(rootInstance.children).toHaveLength(1);
      expect(rootInstance.children?.[0].type).toBe("root")
      expect(rootInstance.children?.[0]).toHaveProperty("originalName")
      expect(rootInstance.children?.[0]).toHaveProperty("originalSlug")
      expect(rootInstance.children?.[0].name).toBe("postInnerRoot")
      expect(rootInstance.children?.[0].slug).toBe("postInnerRoot")
      expect(rootInstance.children?.[0].originalName).toBe("innerRoot")
      expect(rootInstance.children?.[0].originalSlug).toBe("inner_root")
    })

    test("Children of referenced nested types are always frozen", () => {
      expect(true).toBeFalsy()
    })

  })
})
