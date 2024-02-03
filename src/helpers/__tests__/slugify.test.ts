import { test, describe, expect } from "vitest"
import slugify from "../slugify"

describe("slugify", () => {
  test("replaces white spaces", () => {
    expect(slugify("ab c")).toBe("ab_c")
    expect(slugify("ab       c")).toBe("ab_c")
    expect(slugify("ab c d")).toBe("ab_c_d")
  })

  test("split word", () => {
    expect(slugify("HelloWorld")).toBe("hello_world")
    expect(slugify("Hello World")).toBe("hello_world")
    expect(slugify("Hello    World")).toBe("hello_world")
    expect(slugify("Hello_World")).toBe("hello_world")
    expect(slugify("Hello____World")).toBe("hello_world")
  })
})
