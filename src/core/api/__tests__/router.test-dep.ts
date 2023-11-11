import _superagent from "superagent"
import { describe, test, expect } from "@jest/globals"
import express from "express"
import request from "supertest"
import Router from "../router"

// import Router from "~/core/api/router"
// import axios from "axios"

const toHandler =
  (mock: jest.Mock): express.Handler =>
  (_req, res) => {
    mock()
    res.status(200).send()
  }

const toNextHandler =
  (mock: jest.Mock): express.Handler =>
  (_req, _res, next) => {
    mock()
    next()
    // res.status(200).send()
  }

describe("Application routing", () => {
  test("can register a route and call a mock handler", function (done) {
    const mock = jest.fn()

    const app = express()
    app.get("/", toHandler(mock))

    request(app)
      .get("/")
      .expect(200, () => {
        expect(mock).toBeCalled()
        done()
      })
  })

  describe("Router Proxy - without prefix", () => {
    describe("can register multiple route handlers", () => {
      const mock = jest.fn()
      const mock2 = jest.fn()
      const mock3 = jest.fn()
      const mock4 = jest.fn()
      const mock5 = jest.fn()
      const mock6 = jest.fn()
      const mock7 = jest.fn()
      const mock8 = jest.fn()

      const app = express()
      const router = Router()

      router.get("/", toHandler(mock))
      router.get("/:id", toHandler(mock2))
      router.post("/", toHandler(mock3))
      router.post("/:id", toHandler(mock4))
      router.patch("/:id", toHandler(mock5))
      router.put("/:id", toHandler(mock6))
      router.delete("/:id", toHandler(mock7))
      router.all("/:id", toHandler(mock8))

      app.use(router)

      beforeEach(() => {
        ;[mock, mock2, mock3, mock4, mock5, mock6, mock7, mock8].forEach((m) =>
          m.mockClear()
        )
      })

      test("can call get /", (done) => {
        request(app)
          .get("/")
          .expect(200, () => {
            expect(mock).toBeCalled()
            expect(mock2).not.toBeCalled()
            expect(mock3).not.toBeCalled()
            expect(mock4).not.toBeCalled()
            done()
          })
      })

      test("can call post /", (done) => {
        request(app)
          .post("/")
          .expect(200, () => {
            expect(mock).not.toBeCalled()
            expect(mock2).not.toBeCalled()
            expect(mock3).toBeCalled()
            expect(mock4).not.toBeCalled()
            done()
          })
      })

      test("can call post /", (done) => {
        request(app)
          .post("/")
          .expect(200, () => {
            expect(mock).not.toBeCalled()
            expect(mock2).not.toBeCalled()
            expect(mock3).toBeCalled()
            expect(mock4).not.toBeCalled()
            done()
          })
      })

      test("can call post /foobar", (done) => {
        request(app)
          .patch("/foobar")
          .expect(200, () => {
            expect(mock).not.toBeCalled()
            expect(mock2).not.toBeCalled()
            expect(mock3).not.toBeCalled()
            expect(mock4).not.toBeCalled()
            expect(mock5).toBeCalled()
            done()
          })
      })
    })

    test("`use` for middleware without path", (done) => {
      const mock = jest.fn()
      const app = express()
      const router = Router()
      router.use(toHandler(mock))

      app.use(router)

      request(app)
        .get("/")
        .expect(200, () => {
          expect(mock).toBeCalled()
          done()
        })
    })

    test("`use` for middleware with path", (done) => {
      const mock = jest.fn()
      const app = express()
      const router = Router()
      router.use("/mypath", toHandler(mock))

      app.use(router)

      request(app)
        .get("/mypath")
        .expect(200, () => {
          expect(mock).toBeCalled()
          done()
        })
    })

    test("`use` for middleware with regular routes eg get", (done) => {
      const mock = jest.fn()
      const mock1 = jest.fn()
      const app = express()
      const router = Router()
      router.use(toNextHandler(mock))
      router.get("/", toHandler(mock1))

      app.use(router)

      request(app)
        .get("/")
        .expect(200, () => {
          expect(mock).toBeCalled()
          expect(mock1).toBeCalled()
          done()
        })
    })

    test("`use` for middleware with regular routes - /", (done) => {
      const mock = jest.fn()
      const mock1 = jest.fn()
      const app = express()
      const router = Router()
      router.use(toHandler(mock))
      router.get("/foo", toHandler(mock1))

      app.use(router)

      request(app)
        .get("/")
        .expect(200, () => {
          expect(mock).toBeCalled()
          expect(mock1).not.toBeCalled()
          done()
        })
    })

    test("`use` for middleware with regular routes - /foo", (done) => {
      const mock = jest.fn()
      const mock1 = jest.fn()
      const app = express()
      const router = Router()
      router.use("/foo", toHandler(mock))
      router.get("/foo", toHandler(mock1))

      app.use(router)

      request(app)
        .get("/foo")
        .expect(200, () => {
          expect(mock).toBeCalled()
          expect(mock1).not.toBeCalled()
          done()
        })
    })

    test("`use` for middleware with regular routes - /foo/bar ( `use` has matches both `/foo` and `/foo/bar` )", (done) => {
      const mock = jest.fn()
      const mock1 = jest.fn()
      const app = express()
      const router = Router()
      router.use("/foo", toHandler(mock))
      router.get("/foo/bar", toHandler(mock1))

      app.use(router)

      request(app)
        .get("/foo/bar")
        .expect(200, () => {
          expect(mock).toBeCalled()
          expect(mock1).not.toBeCalled()
          done()
        })
    })
  })

  describe("Router Proxy - with prefix", () => {
    describe("can register multiple route handlers", () => {
      const mock = jest.fn()
      const mock2 = jest.fn()
      const mock3 = jest.fn()
      const mock4 = jest.fn()
      const mock5 = jest.fn()
      const mock6 = jest.fn()
      const mock7 = jest.fn()
      const mock8 = jest.fn()

      const app = express()
      const router = express.Router()

      router.get("/", toHandler(mock))
      router.get("/:id", toHandler(mock2))
      router.post("/", toHandler(mock3))
      router.post("/:id", toHandler(mock4))
      router.patch("/:id", toHandler(mock5))
      router.put("/:id", toHandler(mock6))
      router.delete("/:id", toHandler(mock7))
      router.all("/:id", toHandler(mock8))

      app.use(router)
      app.use((_req, res) => {
        // mock8()
        res.status(404).send()
      })
      // app.use("*", (_req, res) => res.status(500).send())

      beforeEach(() => {
        ;[mock, mock2, mock3, mock4, mock5, mock6, mock7, mock8].forEach((m) =>
          m.mockClear()
        )
      })

      // test("no route was called on - /", (done) => {
      //   request(app)
      //     .get("/")
      //     .expect(404, (err, resp) => {
      //       // expect(mock).not.toBeCalled()
      //       // expect(mock2).not.toBeCalled()
      //       // expect(mock3).not.toBeCalled()
      //       // expect(mock4).not.toBeCalled()
      //       // expect(mock8).toBeCalled()
      //       // expect(err).toBeNull()
      //       done()
      //     })
      // })

      test("can call get /", (done) => {
        request(app)
          .get("/")
          .expect(200, () => {
            expect(mock).toBeCalled()
            expect(mock2).not.toBeCalled()
            expect(mock3).not.toBeCalled()
            expect(mock4).not.toBeCalled()
            done()
          })
      })

      test("can call post /", (done) => {
        request(app)
          .post("/")
          .expect(200, () => {
            expect(mock).not.toBeCalled()
            expect(mock2).not.toBeCalled()
            expect(mock3).toBeCalled()
            expect(mock4).not.toBeCalled()
            done()
          })
      })

      test("can call post /", (done) => {
        request(app)
          .post("/")
          .expect(200, () => {
            expect(mock).not.toBeCalled()
            expect(mock2).not.toBeCalled()
            expect(mock3).toBeCalled()
            expect(mock4).not.toBeCalled()
            done()
          })
      })

      test("can call post /foobar", (done) => {
        request(app)
          .patch("/foobar")
          .expect(200, () => {
            expect(mock).not.toBeCalled()
            expect(mock2).not.toBeCalled()
            expect(mock3).not.toBeCalled()
            expect(mock4).not.toBeCalled()
            expect(mock5).toBeCalled()
            done()
          })
      })
    })

    test("`use` for middleware without path", (done) => {
      const mock = jest.fn()
      const app = express()
      const router = Router()
      router.use(toHandler(mock))

      app.use(router)

      request(app)
        .get("/")
        .expect(200, () => {
          expect(mock).toBeCalled()
          done()
        })
    })

    test("`use` for middleware with path", (done) => {
      const mock = jest.fn()
      const app = express()
      const router = Router()
      router.use("/mypath", toHandler(mock))

      app.use(router)

      request(app)
        .get("/mypath")
        .expect(200, () => {
          expect(mock).toBeCalled()
          done()
        })
    })

    test("`use` for middleware with regular routes eg get", (done) => {
      const mock = jest.fn()
      const mock1 = jest.fn()
      const app = express()
      const router = Router()
      router.use(toNextHandler(mock))
      router.get("/", toHandler(mock1))

      app.use(router)

      request(app)
        .get("/")
        .expect(200, () => {
          expect(mock).toBeCalled()
          expect(mock1).toBeCalled()
          done()
        })
    })

    test("`use` for middleware with regular routes - /", (done) => {
      const mock = jest.fn()
      const mock1 = jest.fn()
      const app = express()
      const router = Router()
      router.use(toHandler(mock))
      router.get("/foo", toHandler(mock1))

      app.use(router)

      request(app)
        .get("/")
        .expect(200, () => {
          expect(mock).toBeCalled()
          expect(mock1).not.toBeCalled()
          done()
        })
    })

    test("`use` for middleware with regular routes - /foo", (done) => {
      const mock = jest.fn()
      const mock1 = jest.fn()
      const app = express()
      const router = Router()
      router.use("/foo", toHandler(mock))
      router.get("/foo", toHandler(mock1))

      app.use(router)

      request(app)
        .get("/foo")
        .expect(200, () => {
          expect(mock).toBeCalled()
          expect(mock1).not.toBeCalled()
          done()
        })
    })

    test("`use` for middleware with regular routes - /foo/bar ( `use` has matches both `/foo` and `/foo/bar` )", (done) => {
      const mock = jest.fn()
      const mock1 = jest.fn()
      const app = express()
      const router = Router()
      router.use("/foo", toHandler(mock))
      router.get("/foo/bar", toHandler(mock1))

      app.use(router)

      request(app)
        .get("/foo/bar")
        .expect(200, () => {
          expect(mock).toBeCalled()
          expect(mock1).not.toBeCalled()
          done()
        })
    })
  })
})
