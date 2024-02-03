import { ensureObjectId } from "~/helpers/objectid"
import { v4 } from "uuid"
import { ObjectId } from "mongodb"
import type {
  UsersRepo,
  AccessTokenRepo,
  ProjectsRepo,
  InvitationsRepo,
} from "~/repo"

function createUserCaseFrom(
  users: UsersRepo,
  accessToken: AccessTokenRepo,
  projects: ProjectsRepo,
  invitations: InvitationsRepo
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

    const user = await users.getById(token?._id)

    const invitation = await invitations.getCollection().findOne({
      invites: {
        $elemMatch: {
          token: invitationToken,
          userEmail: user?.email || "n/a",
          expires: { $gt: new Date() },
        },
      },
    })

    if (!invitation) {
      return null
    }

    // assing user to the project
    await users.getCollection().updateOne(
      {
        _id: new ObjectId(token.userId),
      },
      {
        $push: {
          projects: ensureObjectId(invitation?.projectId),
        },
      }
    )

    // remove the invitaiton
    await invitations.deleteInvitation(invitation._id)
  }

  return {
    getProjectsFromToken,
    acceptInvitation,
  }
}

export default createUserCaseFrom
