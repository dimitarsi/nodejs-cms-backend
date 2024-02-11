import { ensureObjectId } from "~/helpers/objectid"
import { v4 } from "uuid"
import { ObjectId } from "mongodb"
import type {
  UsersRepo,
  AccessTokenRepo,
  ProjectsRepo,
  InvitationsRepo,
  PermissionsRepo,
} from "~/repo"

function createUserCaseFrom(
  users: UsersRepo,
  accessToken: AccessTokenRepo,
  projects: ProjectsRepo,
  invitations: InvitationsRepo,
  permissions: PermissionsRepo
) {
  const getProjectsFromToken = async (tokenHeader: string) => {
    const token = await accessToken.findToken(tokenHeader)

    if (!token || !token.userId) {
      // reply.code(404).send({ message: "Not Found or token has expired" })
      // return
      return []
    }

    const permissionForUser = await permissions.gerPermissionsForUser(
      token.userId,
      { read: true }
    )
    const allowedProjects = permissionForUser.map((permission) =>
      permission.projectId.toString()
    )

    return await projects.getAllByIds(allowedProjects)
  }

  const acceptInvitation = async (
    tokenHeader: string,
    projectId: string | ObjectId,
    invitationToken: string
  ) => {
    const token = await accessToken.findToken(tokenHeader)

    if (!token || !token.userId) {
      return
    }

    const user = await users.getById(token?._id)

    const invitation = await invitations.getCollection().findOne({
      invites: {
        $elemMatch: {
          token: invitationToken,
          projectId: ensureObjectId(projectId),
          userEmail: user?.email || "n/a",
          expires: { $gt: new Date() },
        },
      },
    })

    if (!invitation) {
      return
    }

    const invitedUser = await users.getByEmail(invitation.userEmail)

    if (!invitedUser) {
      return
    }

    await permissions.setReadPermissions(token.userId, projectId, "grant")

    // remove the invitaiton
    await invitations.deleteInvitation(invitation._id)
  }

  return {
    getProjectsFromToken,
    acceptInvitation,
  }
}

export default createUserCaseFrom
