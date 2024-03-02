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
    [{}, true],
    [{ __proto: function () {} }, true],
    [{ __foobar: function () {} }, true],
    [{ _data: function () {} }, false],
    [{ data: null }, false],
    [0, false],
    [[], true],
    [[1, 2, 3], false],
    ["", true],
    ["abc", false],
  ])("emptyDataOrNull - '%s'", (testCase, expected) => {
    expect(emptyDataOrNull(testCase)).toEqual(expected)
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
          testCase.content as BaseContentData<
            any,
            Omit<ContentType, "projectId">
          >,
          testCase.config as Omit<ContentType, "projectId">
        )
      ).toEqual(testCase.expected)
    }
  )

  test.each([
    [
      "Keep the structure and add `children` and `outdated` properties",
      {
        content: {
          name: "Root Element",
          slug: "root-element",
          data: null,
          isFolder: false,
          folderLocation: "/",
          folderTarget: "/",
          folderDepth: 0,
          children: [
            {
              name: "Title",
              slug: "title",
              config: {
                name: "Title",
                slug: "title",
                type: "text",
                // children: [],
                // defaultValue: null,
                repeated: null,
              } as ContentType,
              data: "hello-world",
            } as BaseContentData,
          ],
          config: {
            repeated: null,
            name: "Foo",
            slug: "foo",
            type: "root",
            children: [],
            defaultValue: null,
          },
        } as Omit<
          ContentWithConfig<Omit<ContentType, "projectId">>,
          "updatedOn" | "createdOn" | "active" | "projectId"
        >,
        config: {
          repeated: null,
          name: "Foo",
          slug: "foo",
          type: "root",
          children: [
            {
              name: "Title",
              slug: "title",
              type: "text",
              repeated: null,
            },
          ],
          defaultValue: null,
        } as ContentType,
        expected: {
          name: "Root Element",
          slug: "root-element",
          data: null,
          isFolder: false,
          folderLocation: "/",
          folderTarget: "/",
          outdated: false,
          folderDepth: 0,
          children: [
            {
              name: "Title",
              slug: "title",
              children: [],
              config: {
                name: "Title",
                slug: "title",
                type: "text",
                repeated: null,
              },
              data: "hello-world",
              outdated: false,
            },
          ],
          config: {
            repeated: null,
            name: "Foo",
            slug: "foo",
            type: "root",
            children: [],
            defaultValue: null,
          },
        },
      },
    ],
  ])(
    "`validateContentWithConfig` return data structure - %s",
    (_descr, testCase) => {
      expect(
        validateContentWithConfig(testCase.content, testCase.config)
      ).toEqual(testCase.expected)
    }
  )

  test.each([
    [
      "no nested children",
      {
        config: {
          type: "root",
          name: "Top Level",
          slug: "top-level",
          children: [],
          defaultValue: null,
          repeated: null,
          projectId: new ObjectId(),
        } as ContentType,
        expected: {
          name: "Top Level",
          slug: "top-level",
          children: [],
          config: {
            type: "root",
            name: "Top Level",
            slug: "top-level",
            children: [],
            defaultValue: null,
            repeated: null,
          },
          data: "",
        },
      },
    ],
  ])("`generateFromConfig()` - %s", (_descr, testCase) => {
    expect(generateFromConfig(testCase.config)).toMatchObject(testCase.expected)
  })
})
