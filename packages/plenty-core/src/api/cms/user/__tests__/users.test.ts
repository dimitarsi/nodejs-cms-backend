import { describe, test, expect, beforeAll, afterAll, afterEach } from "vitest"
import app from "~/app"
import request from "supertest"
import { createUserPayload } from "~/cli/seed/data/createUser"
import { MongoClient, ObjectId } from "mongodb"
import users from "~/repo/users"

describe("Authentication", async () => {
  const slug = "slug"
  const testUserEmail = "users_test_email@gmail.com"
  const mongoClient = new MongoClient(
    process.env.MONGO_URL || "mongodb://root:example@localhost:27017"
  )
  const db = await mongoClient.db(process.env.DB_NAME)
  const usersRepo = users(db)

  beforeAll(async () => {
    const testUser = await usersRepo.getByEmail(testUserEmail)
    const testUser2 = await usersRepo.getByEmail(`other_${testUserEmail}`)
    if (testUser) {
      await usersRepo.deleteById(testUser._id.toString())
    }
    if (testUser2) {
      await usersRepo.deleteById(testUser2._id.toString())
    }
  })

  afterAll(async () => {
    await app.close()
  })

  test("GET, POST, PATCH, DELETE - /users - Users can register, login, modify and delete accounts", async () => {
    await app.ready()

    const userData = createUserPayload(testUserEmail)

    await request(app.server).post("/users").send(userData).expect(201)

    let rawUser = await db.collection("users").findOne({ email: testUserEmail })
    const userId = rawUser?._id.toString()

    expect(rawUser).toBeTruthy()

    expect(() => {
      new ObjectId(userId)
    }).not.toThrow()

    // Activate the user before login
    await request(app.server)
      .get(`/users/${userId}/activate?hash=${rawUser!.activationHash}`)
      .expect(204)

    const loginResponse = await request(app.server)
      .post("/login")
      .send({
        email: userData.email,
        password: userData.password,
      })
      .expect(200)

    await request(app.server)
      .patch(`/users/${userId}`)
      .set("X-Access-Token", loginResponse.body.accessToken)
      .send({
        firstName: "Test",
        lastName: "Acc",
      })
      .expect(200)

    rawUser = await db.collection("users").findOne({ email: testUserEmail })

    expect(rawUser).toBeTruthy()
    expect(rawUser).toHaveProperty("firstName")
    expect(rawUser).toHaveProperty("lastName")
    expect(rawUser!.firstName).toBe("Test")
    expect(rawUser!.lastName).toBe("Acc")

    await request(app.server)
      .delete(`/users/${userId}`)
      .set("X-Access-Token", loginResponse.body.accessToken)
      .expect(200)

    rawUser = await db.collection("users").findOne({ email: testUserEmail })

    expect(rawUser).toBeFalsy()

    await request(app.server)
      .get(`/users/${userId}`)
      .set("X-Access-Token", loginResponse.body.accessToken)
      .expect(403)
  })

  test("GET, POST, PATCH, DELETE - /users - Registered users cannot modify, delete other registered users", async () => {
    await app.ready()

    const userDataOther = createUserPayload(`other_${testUserEmail}`)
    const userData = createUserPayload(testUserEmail)

    await request(app.server).post("/users").send(userData).expect(201)
    await request(app.server).post("/users").send(userDataOther).expect(201)

    let rawUser = await db.collection("users").findOne({ email: testUserEmail })
    let rawUser2 = await db
      .collection("users")
      .findOne({ email: userDataOther.email })
    const userId = rawUser?._id.toString()
    const userId2 = rawUser2?._id.toString()

    expect(rawUser).toBeTruthy()
    expect(userId2).toBeTruthy()

    expect(() => {
      new ObjectId(userId)
      new ObjectId(userId2)
    }).not.toThrow()

    // Cannot activate user with a foreign token
    await request(app.server)
      .get(`/users/${userId}/activate?hash=${rawUser2!.activationHash}`)
      .expect(404)

    // Cannot activate user with a foreign token
    await request(app.server)
      .get(`/users/${userId2}/activate?hash=${rawUser!.activationHash}`)
      .expect(404)

    // Activate the user before login
    await request(app.server)
      .get(`/users/${userId}/activate?hash=${rawUser!.activationHash}`)
      .expect(204)

    // Activate the user before login
    await request(app.server)
      .get(`/users/${userId2}/activate?hash=${rawUser2!.activationHash}`)
      .expect(204)

    // Cannot login with the wrong credentials
    await request(app.server)
      .post("/login")
      .send({
        email: `bad_${userData.email}`,
        password: userData.password,
      })
      .expect(401)

    const loginResponse = await request(app.server)
      .post("/login")
      .send({
        email: userData.email,
        password: userData.password,
      })
      .expect(200)

    const loginResponse2 = await request(app.server)
      .post("/login")
      .send({
        email: `other_${testUserEmail}`,
        password: userData.password,
      })
      .expect(200)

    await request(app.server)
      .patch(`/users/${userId2}`)
      .set("X-Access-Token", loginResponse.body.accessToken)
      .send({
        firstName: "Test",
        lastName: "Acc",
      })
      .expect(403)

    rawUser = await db
      .collection("users")
      .findOne({ email: `other_${testUserEmail}` })

    // No changes to the stored data
    expect(rawUser).toBeTruthy()
    expect(rawUser).toHaveProperty("firstName")
    expect(rawUser).toHaveProperty("lastName")
    expect(rawUser!.email).toBe(`other_${testUserEmail}`)
    expect(rawUser!.firstName).toBe(userData.firstName)
    expect(rawUser!.lastName).toBe(userData.lastName)

    await request(app.server)
      .delete(`/users/${userId2}`)
      .set("X-Access-Token", loginResponse.body.accessToken)
      .expect(403)
  })
})
