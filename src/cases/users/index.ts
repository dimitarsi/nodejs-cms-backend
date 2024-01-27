import { v4 } from "uuid"
import { ObjectId } from "mongodb"
import type { UsersRepo, AccessTokenRepo, ProjectsRepo } from "~/repo"

function createUserCaseFrom(
  users: UsersRepo,
  accessToken: AccessTokenRepo,
  projects: ProjectsRepo
) {
  const getProjectsFromToken = async (tokenHeader: string) => {
    const token = await accessToken.findToken(tokenHeader)

    if (!token || !token.userId) {
      // reply.code(404).send({ message: "Not Found or token has expired" })
      // return
      return []
    }

    const user = await users.getById(token.userId)

    if (!user?.projects || !user.projects.length) {
      // reply.code(404).send({
      //   message: "Not Found or User is not assigned to any projects",
      // })
      return []
    }

    return await projects.getAllByIds(user.projects)
  }

  const inviteUserToProject = async (
    inviteEmail: string,
    projectId: string | ObjectId
  ) => {
    const inviteToken = v4()
    const expires = new Date()
    expires.setDate(expires.getDate() + 7) // 1 week

    const invitation = { inviteToken: inviteToken.toString(), expires }

    let byId = {}

    try {
      byId = { _id: new ObjectId(projectId) }
    } catch (e) {
      byId = { _id: projectId }
    }

    await projects.getCollection().updateOne(byId, {
      $set: {
        "invites.$": invitation,
      },
    })
  }

  const acceptInvitation = async (
    tokenHeader: string,
    invitationToken: string
  ) => {
    const token = await accessToken.findToken(tokenHeader)

    if (!token || !token.userId) {
      // reply.code(404).send({ message: "Not Found or token has expired" })
      // return
      return []
    }

    const project = await projects.getCollection().findOne({
      invites: {
        $elemMatch: {
          token: invitationToken,
          expires: { $gt: new Date() },
        },
      },
    })

    if (!project) {
      return null
    }

    // assing user to the project
    await users.getCollection().updateOne(
      {
        _id: new ObjectId(token.userId),
      },
      {
        $set: {
          "projects.$": project?._id,
        },
      }
    )

    // remove the invitaiton
    await projects.getCollection().updateOne(
      { _id: project._id },
      {
        $pull: {
          invites: { token: invitationToken },
        },
      }
    )
  }

  return {
    getProjectsFromToken,
    inviteUserToProject,
    acceptInvitation,
  }
}

export default createUserCaseFrom
