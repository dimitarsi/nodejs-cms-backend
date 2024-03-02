import { describe, test, expect } from "vitest"
import { diff, emptyDataOrNull, isSameRepeated, keyBy } from "../helpers"

describe("Content Service helpers", () => {
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
    [{ data: undefined, expected: true }],
    [
      {
        data: null,
        expected: true,
      },
    ],
    [{ data: {}, expected: true }],
    [{ data: { __foo: "bar" }, expected: true }],
    [{ data: [], expected: true }],
    [{ data: "", expected: true }],
    [{ data: 0, expected: false }],
    [{ data: ["foo"], expected: false }],
    [{ data: { foo: "bar" }, expected: false }],
    [{ data: 42, expected: false }],
    [{ data: "random string", expected: false }],
  ])(`helpers - emptyDataOrNull - %s`, (testCase) => {
    expect(emptyDataOrNull(testCase.data)).toEqual(testCase.expected)
  })
})
