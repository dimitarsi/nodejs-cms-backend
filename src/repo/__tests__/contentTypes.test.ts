import { describe, expect, test, beforeEach, afterAll, afterEach } from "vitest"

import contentTypes from "../contentTypes"
import mongoClient from "@db"

import {
  ContentType,
  compositeContentType,
  createContentType,
} from "~/models/contentType"
import { ObjectId } from "mongodb"

describe("ContentTypes Repo", async () => {
  const db = await mongoClient.db(`${process.env.DB_NAME}-repo`)
  let repo = contentTypes(db)

  beforeEach(async () => {
    await repo.deleteAll()
  })

  afterAll(() => {
    mongoClient.close(true)
  })

  test("Can create and find simple content Types", async () => {
    const projectId = new ObjectId()
    await repo.create(createContentType("Title", projectId))

    const item = await repo.getById("title", projectId)

    expect(item).toBeDefined()

    expect(item!.type).toBe("root")
    expect(item!.name).toBe("Title")
    expect(item!._id).toBeDefined()
  })

  describe("Nested references", () => {
    const projectId = new ObjectId()

    const post = compositeContentType("Post", projectId, true)
    const seo = compositeContentType("SEO", projectId, true)

    seo
      .add(createContentType("title", projectId))
      .add(createContentType("description", projectId))
      .add(createContentType("image", projectId))

    beforeEach(async () => {
      await repo.create(seo.getType())

      const seoItem = await repo.getById("seo", projectId)

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
      const postItem = await repo.getById("post", projectId)

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
      seo.add(createContentType("schemaType", projectId))

      await repo.update("seo", projectId, seo.getType())

      const postItem = await repo.getById("post", projectId)

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

    test("Preserving original contentType name when root contentType", async () => {
      const root = compositeContentType("root", projectId, true)
      const innerRoot = compositeContentType("innerRoot", projectId, true)

      await repo.create(innerRoot.getType())

      const innerRootInstance = await repo.getById("inner_root", projectId)

      expect(innerRootInstance).toBeDefined()
      expect(innerRootInstance!._id).toBeDefined()

      const renamedInnerRoot: ContentType = {
        _id: innerRootInstance!._id,
        name: "postInnerRoot",
        slug: "postInnerRoot",
        type: "root",
        children: [],
        repeated: null,
        defaultValue: null,
        projectId,
      }

      root.add(renamedInnerRoot)

      await repo.create(root.getType())

      const rootInstance = await repo.getById("root", projectId)

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
