import type { BaseContentData, ContentWithConfig } from "~/models/content"
import { describe, test, expect } from "vitest"
import {
  emptyDataOrNull,
  generateFromConfig,
  isSameRepeated,
  mergeChildren,
  validateContentWithConfig,
} from "../helpers"
import type { ContentType } from "~/models/contentType"
import { ObjectId } from "mongodb"

describe("Content Service", () => {
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
})
