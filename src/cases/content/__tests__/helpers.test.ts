import { describe, test, expect } from "@jest/globals"
import {
  diff,
  isSameRepeated,
  keyBy,
  mergeChildren,
  validateContentWithConfig,
} from "../helpers"
import { BaseContentData } from "~/models/content"

describe("Content case helpers", () => {
  test("Can diff keys - union", () => {
    const diffed = diff(["a", "b"], ["b", "c"])

    expect(diffed).toEqual(["a", "c"])
  })

  test("Can diff keys - subset", () => {
    const diffed = diff(["a", "b"], ["b"])

    expect(diffed).toEqual(["a"])
  })

  test("Can diff keys - no subset", () => {
    const diffed = diff(["a", "b"], ["c", "d"])

    expect(diffed).toEqual(["a", "b", "c", "d"])
  })

  test("Can diff keys - same, different order", () => {
    const diffed = diff(["a", "b"], ["b", "a"])

    expect(diffed).toHaveLength(0)
  })

  test("helpers 'keyBy'", () => {
    const obj = [{ slug: "foo" }, { slug: "bar" }]

    const keyed = keyBy(obj, "slug")

    expect(keyed).toHaveProperty("foo")
    expect(keyed).toHaveProperty("bar")
  })

  test.each([
    [null, null, true],
    [{ min: 0, max: 1 }, { min: 0, max: 1 }, true],
    [{ min: 0, max: 1 }, null, false],
    [{ min: 0, max: 1 }, { min: 0, max: 4 }, false],
  ])("helpers - isSameRepeated - A: %s - B: %s", (a, b, expected) => {
    expect(isSameRepeated({ repeated: a }, { repeated: b })).toEqual(expected)
  })

  test.each([
    [
      "Can merge without duplicating, all children are the same",
      {
        childrenA: [
          { slug: "foo", type: "text" },
          { slug: "bar", type: "text" },
        ],
        childrenB: [
          { slug: "foo", type: "text" },
          { slug: "bar", type: "text" },
        ],
        expected: {
          children: [
            { slug: "foo", type: "text" },
            { slug: "bar", type: "text" },
          ],
          hasDifferentKeys: false,
        },
      },
    ],
    [
      "Append children from config, no overwritting",
      {
        childrenA: [
          { slug: "foo", type: "text" },
          { slug: "bar", type: "text" },
        ],
        childrenB: [
          { slug: "foo", type: "text" },
          { slug: "bar", type: "number" },
          { slug: "baz", type: "toggle" },
        ],
        expected: {
          children: [
            { slug: "foo", type: "text" },
            { slug: "bar", type: "text" },
            { slug: "baz", type: "toggle" },
          ],
          hasDifferentKeys: true,
        },
      },
    ],
    [
      "Append children from config, no overwritting, empty content",
      {
        childrenA: [],
        childrenB: [
          { slug: "foo", type: "text" },
          { slug: "bar", type: "number" },
          { slug: "baz", type: "toggle" },
        ],
        expected: {
          children: [
            { slug: "foo", type: "text" },
            { slug: "bar", type: "number" },
            { slug: "baz", type: "toggle" },
          ],
          hasDifferentKeys: true,
        },
      },
    ],
  ])("helpers - mergeChildren - %s", (_descr, testCase) => {
    expect(mergeChildren(testCase.childrenA, testCase.childrenB)).toEqual(
      testCase.expected
    )
  })

  test.each([
    [
      "Compare simple case",
      {
        content: {
          name: "Foo",
          data: null,
          slug: "foo",
          type: "text",
          config: {
            repeated: null,
            name: "Foo",
            slug: "foo",
            type: "text",
            children: [],
            defaultValue: null,
          },
          children: [],
        },
        config: {
          type: "text" as const,
          name: "Foo",
          slug: "foo",
          repeated: null,
          defaultValue: null,
          children: [],
        },
        expected: {
          name: "Foo",
          data: null,
          slug: "foo",
          type: "text",
          config: {
            repeated: null,
            name: "Foo",
            slug: "foo",
            type: "text",
            children: [],
            defaultValue: null,
          },
          children: [],
          outdated: false,
        },
      },
    ],
    [
      "Compare simple case, config has different `type`",
      {
        content: {
          name: "Foo",
          data: null,
          slug: "foo",
          type: "text",
          config: {
            repeated: null,
            name: "Foo",
            slug: "foo",
            type: "text",
            children: [],
            defaultValue: null,
          },
          children: [],
        },
        config: {
          type: "number" as const,
          name: "Foo",
          slug: "foo",
          repeated: null,
          defaultValue: null,
          children: [],
        },
        expected: {
          name: "Foo",
          data: null,
          slug: "foo",
          type: "text",
          config: {
            repeated: null,
            name: "Foo",
            slug: "foo",
            type: "text",
            children: [],
            defaultValue: null,
          },
          children: [],
          outdated: true,
        },
      },
    ],
    [
      "Compare simple case, config has different `slug`",
      {
        content: {
          name: "Foo",
          data: null,
          slug: "foo",
          type: "text",
          config: {
            repeated: null,
            name: "Foo",
            slug: "foo",
            type: "text",
            children: [],
            defaultValue: null,
          },
          children: [],
        },
        config: {
          type: "text" as const,
          name: "Foo",
          slug: "bar",
          repeated: null,
          defaultValue: null,
          children: [],
        },
        expected: {
          name: "Foo",
          data: null,
          slug: "foo",
          type: "text",
          config: {
            repeated: null,
            name: "Foo",
            slug: "foo",
            type: "text",
            children: [],
            defaultValue: null,
          },
          children: [],
          outdated: true,
        },
      },
    ],
    [
      "Nested case, outdated child",
      {
        content: {
          name: "Foo",
          data: null,
          slug: "foo",
          type: "text",
          config: {
            repeated: null,
            name: "Foo",
            slug: "foo",
            type: "text",
            children: [],
            defaultValue: null,
          },
          children: [
            {
              name: "Bar",
              data: null,
              slug: "bar",
              type: "text",
              config: {
                repeated: null,
                name: "Bar",
                slug: "bar",
                type: "text",
                children: [],
                defaultValue: null,
              },
              children: [],
            },
          ],
        },
        config: {
          type: "text" as const,
          name: "Foo",
          slug: "foo",
          repeated: null,
          defaultValue: null,
          children: [
            {
              type: "number" as const,
              name: "Bar",
              slug: "bar",
              repeated: null,
              defaultValue: null,
              children: [],
            },
          ],
        },
        expected: {
          name: "Foo",
          data: null,
          slug: "foo",
          type: "text",
          // Parent is not outdated
          outdated: false,
          config: {
            repeated: null,
            name: "Foo",
            slug: "foo",
            type: "text",
            children: [],
            defaultValue: null,
          },
          children: [
            {
              name: "Bar",
              data: null,
              slug: "bar",
              type: "text",
              // Child is not outdated
              outdated: true,
              config: {
                repeated: null,
                name: "Bar",
                slug: "bar",
                type: "text",
                children: [],
                defaultValue: null,
              },
              children: [],
            },
          ],
        },
      },
    ],
  ])(
    "Check content agains config and mark as outdated - %s",
    (_descr, testCase) => {
      expect(
        validateContentWithConfig(
          testCase.content as BaseContentData,
          testCase.config
        )
      ).toEqual(testCase.expected)
    }
  )
})
