import { ensureObjectId } from "~/helpers/objectid"
import app from "~/app"
import { describe, test, afterAll, beforeAll, afterEach, expect } from "vitest"
import request from "supertest"
import { createProjectPayload } from "~/cli/seed/data/createProject"
import { MongoClient, ObjectId } from "mongodb"
import accessTokens from "~/repo/accessTokens"
import permissions from "~/repo/permissions"
import projects from "~/repo/projects"
import { createUserPayload } from "~/cli/seed/data/createUser"

describe("Projects", async () => {
  const slug = "slug"

  const mongoClient = new MongoClient(
    process.env.MONGO_URL || "mongodb://root:example@localhost:27017"
  )
  const db = await mongoClient.db(process.env.DB_NAME)
  const accessTokensRepo = accessTokens(db)
  const permissionsRepo = permissions(db)
  const projectsRepo = projects(db)

  const PROJECTS_API_ADMIN_TOKEN = "projects-API-admin-token"
  const PROJECTS_API_NON_ADMIN_TOKEN = "projects-API-non-admin-token"

  let projectId: ObjectId
  const userId = new ObjectId()
  const otherUserId = new ObjectId()

  // Seed tokens
  beforeAll(async () => {
    await db.collection("projects").deleteMany({})

    const result = await projectsRepo.create(createProjectPayload(userId))

    if (result === null) {
      throw "Could not create project. Make sure the database is cleared between tests"
    }

    projectId = ensureObjectId(result.insertedId)

    await Promise.all([
      permissionsRepo.setAdminUser(userId, projectId, "grant"),
      permissionsRepo.setAdminUser(otherUserId, projectId, "revoke"),
      accessTokensRepo.findOrCreateAccessToken(
        userId,
        PROJECTS_API_ADMIN_TOKEN
      ),
      accessTokensRepo.findOrCreateAccessToken(
        otherUserId,
        PROJECTS_API_NON_ADMIN_TOKEN
      ),
    ])
  })

  afterAll(async () => {
    await accessTokensRepo.deactivateToken(PROJECTS_API_ADMIN_TOKEN)
    await accessTokensRepo.deactivateToken(PROJECTS_API_NON_ADMIN_TOKEN)

    await app.close()
    await mongoClient.close()
  })

  afterEach(async () => {
    await db.collection("contents").deleteMany({})
  })

  describe("Needs authentication", () => {
    test("POST /users - cannot create project - user needs to be logged in", async () => {
      await app.ready()
      await request(app.server)
        .post("/projects")
        .send(createProjectPayload(userId))
        .expect(403)
    })

    test("GET /projects - user needs to be logged in", async () => {
      await app.ready()
      await request(app.server).get("/projects").expect(403)
    })

    test("GET /projects/:projectId - user needs to be logged in", async () => {
      await app.ready()
      await request(app.server)
        .get(`/projects/${projectId.toString()}`)
        .expect(403)
    })

    test("DELETE /projects/:projectId - user needs to be logged in", async () => {
      await app.ready()
      await request(app.server)
        .delete(`/projects/${projectId.toString()}`)
        .expect(403)
    })

    test("PATCH /projects/:idOrSlug - user needs to be logged in", async () => {
      await app.ready()
      await request(app.server)
        .delete(`/projects/${projectId.toString()}`)
        .expect(403)
    })
  })

  describe("Only Admins can create, delete, update and inspect projects", () => {
    describe("As Admin", () => {
      test("POST /projects", async () => {
        await app.ready()

        const resp = await request(app.server)
          .post("/projects")
          .set("X-Access-Token", PROJECTS_API_ADMIN_TOKEN)
          .send(createProjectPayload(userId))
          .expect(201)
      })

      test("POST /projects - cannot create project with the same name and same owner", async () => {
        await app.ready()

        const resp = await request(app.server)
          .post("/projects")
          .set("X-Access-Token", PROJECTS_API_ADMIN_TOKEN)
          .send(createProjectPayload(userId, "Another Project"))
          .expect(201)

        const resp2 = await request(app.server)
          .post("/projects")
          .set("X-Access-Token", PROJECTS_API_ADMIN_TOKEN)
          .send(createProjectPayload(userId, "Another Project"))
          .expect(422)
      })

      test("POST /projects - can create project with the same name but different owner", async () => {
        await app.ready()

        const resp = await request(app.server)
          .post("/projects")
          .set("X-Access-Token", PROJECTS_API_ADMIN_TOKEN)
          .send(createProjectPayload(userId, "Another Project 2"))
          .expect(201)

        const resp2 = await request(app.server)
          .post("/projects")
          .set("X-Access-Token", PROJECTS_API_NON_ADMIN_TOKEN)
          .send(createProjectPayload(otherUserId, "Another Project 2"))
          .expect(201)
      })

      test("GET /projects", async () => {
        await app.ready()

        const resp = await request(app.server)
          .get("/projects")
          .set("X-Access-Token", PROJECTS_API_ADMIN_TOKEN)
          .expect(200)

        expect(resp.body.length).toBeGreaterThan(0)
        expect(resp.body[0]).toHaveProperty("name")
        expect(resp.body[0]).toHaveProperty("owner")
        expect(resp.body[0].active).toBeTruthy()
      })

      test("PATCH /projects", async () => {
        await app.ready()
        const resp = await request(app.server)
          .post("/projects")
          .set("X-Access-Token", PROJECTS_API_ADMIN_TOKEN)
          .send(createProjectPayload(userId, "Patch Project Name"))
          .expect(201)

        await request(app.server)
          .patch(`/projects/${resp.body.insertedId}`)
          .set("X-Access-Token", PROJECTS_API_ADMIN_TOKEN)
          .send({
            name: "Updated Project",
          })
          .expect(200)

        await request(app.server)
          .patch(`/projects/${resp.body.insertedId}`)
          .set("X-Access-Token", PROJECTS_API_ADMIN_TOKEN)
          .send({
            owner: userId.toString(),
          })
          .expect(422)
      })
    })

    describe("As Non-Admin", () => {
      beforeAll(async () => {
        await Promise.all([
          projectsRepo.deleteForUser(otherUserId),
          permissionsRepo.deleteForUser(otherUserId),
        ])
      })

      test("GET /projects - is Forbidden", async () => {
        await app.ready()
        await request(app.server)
          .get("/projects")
          .set("X-Access-Token", PROJECTS_API_NON_ADMIN_TOKEN)
          .expect(404)
      })

      test("GET /projects/:projectId - is Forbidden", async () => {
        await app.ready()

        const resp = await request(app.server)
          .post("/projects")
          .set("X-Access-Token", PROJECTS_API_ADMIN_TOKEN)
          .send(createProjectPayload(userId, "Text non-admin Get request"))
          .expect(201)

        expect(resp.body).toHaveProperty("insertedId")

        await request(app.server)
          .get(`/projects/${resp.body.insertedId}`)
          .set("X-Access-Token", PROJECTS_API_NON_ADMIN_TOKEN)
          .expect(403)
      })

      test("PATCH /projects - is Forbidden", async () => {
        await app.ready()

        const resp = await request(app.server)
          .post("/projects")
          .set("X-Access-Token", PROJECTS_API_ADMIN_TOKEN)
          .send(createProjectPayload(userId, "Test non-admin Patch request"))
          .expect(201)

        expect(resp.body).toHaveProperty("insertedId")

        await request(app.server)
          .patch(`/projects/${resp.body.insertedId}`)
          .set("X-Access-Token", PROJECTS_API_NON_ADMIN_TOKEN)
          .send({
            name: "Changed by another User",
          })
          .expect(403)
      })
    })
  })

  describe("Invite to project", () => {
    test("User cannot accept an invite without activating his account first", async () => {
      await app.ready()
      const userDataOther = createUserPayload(`invitation.inactive@gmail.com`)

      const createProject = await request(app.server)
        .post("/projects")
        .set("x-access-token", PROJECTS_API_ADMIN_TOKEN)
        .send(createProjectPayload(userId, "You shall not pass"))
        .expect(201)

      await request(app.server)
        .post(`/projects/${createProject.body.insertedId}/invite`)
        .set("x-access-token", PROJECTS_API_ADMIN_TOKEN)
        .send({ userEmail: userDataOther.email })
        .expect(201)

      const invitation = await db
        .collection("invitations")
        .findOne({ userEmail: userDataOther.email })

      expect(invitation).toBeTruthy()
      expect(invitation).toHaveProperty("token")

      await request(app.server).post(`/users`).send(userDataOther)

      const loginResponse = await request(app.server)
        .post("/login")
        .send({
          email: userDataOther.email,
          password: userDataOther.password,
        })
        .expect(401)

      await request(app.server)
        .post(
          `/projects/${createProject.body.insertedId}/join?invitationToken=${
            invitation!.token
          }`
        )
        // .set("X-Access-Token", loginResponse.body.accessToken)
        .expect(403)
    })

    test("User with manage permissions can invite another user to the same project with default read permissions", async () => {
      await app.ready()
      const userDataOther = createUserPayload(`invitation@gmail.com`)

      const createProject = await request(app.server)
        .post("/projects")
        .set("x-access-token", PROJECTS_API_ADMIN_TOKEN)
        .send(createProjectPayload(userId, "InvitationsOnly"))
        .expect(201)

      await request(app.server)
        .post(`/projects/${createProject.body.insertedId}/invite`)
        .set("x-access-token", PROJECTS_API_ADMIN_TOKEN)
        .send({ userEmail: userDataOther.email })
        .expect(201)

      const invitation = await db
        .collection("invitations")
        .findOne({ userEmail: userDataOther.email })

      expect(invitation).toBeTruthy()
      expect(invitation).toHaveProperty("token")

      await request(app.server).post(`/users`).send(userDataOther)

      let rawUser2 = await db
        .collection("users")
        .findOne({ email: userDataOther.email })

      await request(app.server)
        .get(
          `/users/${rawUser2?._id.toString()}/activate?hash=${
            rawUser2!.activationHash
          }`
        )
        .expect(204)

      const loginResponse = await request(app.server).post("/login").send({
        email: userDataOther.email,
        password: userDataOther.password,
      })

      await request(app.server)
        .post(
          `/projects/${createProject.body.insertedId}/join?invitationToken=${
            invitation!.token
          }`
        )
        .set("X-Access-Token", loginResponse.body.accessToken)
        .expect(200)

      const userPermissions = await db.collection("permissions").findOne({
        projectId: ensureObjectId(createProject.body.insertedId),
        userId: rawUser2?._id,
      })

      expect(userPermissions).toBeTruthy()
      expect(userPermissions).toHaveProperty("read")
      expect(userPermissions).toHaveProperty("write")
      expect(userPermissions).toHaveProperty("manage")

      expect(userPermissions?.read).toBeTruthy()
      expect(userPermissions?.write).toBeFalsy()
      expect(userPermissions?.manage).toBeFalsy()

      await request(app.server)
        .get(`/projects`)
        .set("X-Access-Token", loginResponse.body.accessToken)
        .expect(200)

      await request(app.server)
        .get(`/projects/${createProject.body.insertedId}`)
        .set("X-Access-Token", loginResponse.body.accessToken)
        .expect(200)

      await request(app.server)
        .patch(`/projects/${createProject.body.insertedId}`)
        .set("X-Access-Token", loginResponse.body.accessToken)
        .send({
          name: "Change the Project Name",
        })
        .expect(403)

      await request(app.server)
        .delete(`/projects/${createProject.body.insertedId}`)
        .set("X-Access-Token", loginResponse.body.accessToken)
        .expect(403)
    })

    test("User cannot join the wrong project", async () => {
      await app.ready()
      const userDataOther2 = createUserPayload(`invitation2@gmail.com`)
      const userDataOther3 = createUserPayload(`invitation3@gmail.com`)

      const createProject = await request(app.server)
        .post("/projects")
        .set("x-access-token", PROJECTS_API_ADMIN_TOKEN)
        .send(createProjectPayload(userId, "Invitation check"))
        .expect(201)

      await request(app.server)
        .post(`/projects/${createProject.body.insertedId}/invite`)
        .set("x-access-token", PROJECTS_API_ADMIN_TOKEN)
        .send({ userEmail: userDataOther2.email })
        .expect(201)

      await request(app.server)
        .post(`/projects/${createProject.body.insertedId}/invite`)
        .set("x-access-token", PROJECTS_API_ADMIN_TOKEN)
        .send({ userEmail: userDataOther3.email })
        .expect(201)

      const invitation2 = await db
        .collection("invitations")
        .findOne({ userEmail: userDataOther2.email })

      const invitation3 = await db
        .collection("invitations")
        .findOne({ userEmail: userDataOther3.email })

      expect(invitation2).toBeTruthy()
      expect(invitation3).toBeTruthy()
      expect(invitation2).toHaveProperty("token")
      expect(invitation3).toHaveProperty("token")

      await request(app.server).post(`/users`).send(userDataOther2)
      await request(app.server).post(`/users`).send(userDataOther3)

      let rawUser2 = await db
        .collection("users")
        .findOne({ email: userDataOther2.email })

      let rawUser3 = await db
        .collection("users")
        .findOne({ email: userDataOther3.email })

      // Using the wrong activation token
      await request(app.server)
        .get(
          `/users/${rawUser2?._id.toString()}/activate?hash=${
            rawUser3!.activationHash
          }`
        )
        .expect(404)

      // Using the wrong activation token
      await request(app.server)
        .get(
          `/users/${rawUser3?._id.toString()}/activate?hash=${
            rawUser2!.activationHash
          }`
        )
        .expect(404)

      await request(app.server)
        .get(
          `/users/${rawUser2?._id.toString()}/activate?hash=${
            rawUser2!.activationHash
          }`
        )
        .expect(204)

      await request(app.server)
        .get(
          `/users/${rawUser3?._id.toString()}/activate?hash=${
            rawUser3!.activationHash
          }`
        )
        .expect(204)

      const loginResponse2 = await request(app.server).post("/login").send({
        email: userDataOther2.email,
        password: userDataOther2.password,
      })

      const loginResponse3 = await request(app.server).post("/login").send({
        email: userDataOther3.email,
        password: userDataOther3.password,
      })

      await request(app.server)
        .post(
          `/projects/${createProject.body.insertedId}/join?invitationToken=${
            invitation2!.token
          }`
        )
        .set("x-access-token", loginResponse3.body.accessToken)
        .expect(404)

      await request(app.server)
        .post(
          `/projects/${createProject.body.insertedId}/join?invitationToken=${
            invitation3!.token
          }`
        )
        .set("x-access-token", loginResponse2.body.accessToken)
        .expect(404)

      await request(app.server)
        .post(
          `/projects/${createProject.body.insertedId}/join?invitationToken=${
            invitation2!.token
          }`
        )
        .set("x-access-token", loginResponse2.body.accessToken)
        .expect(200)

      await request(app.server)
        .post(
          `/projects/${createProject.body.insertedId}/join?invitationToken=${
            invitation3!.token
          }`
        )
        .set("x-access-token", loginResponse3.body.accessToken)
        .expect(200)
    })
  })
})
