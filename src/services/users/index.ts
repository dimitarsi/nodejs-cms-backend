import { ensureObjectId } from "~/helpers/objectid"
import { ObjectId, WithId } from "mongodb"
import type {
  UsersRepo,
  AccessTokenRepo,
  ProjectsRepo,
  InvitationsRepo,
  PermissionsRepo,
} from "~/repo"
import type { UserWithPermissions } from "~/models/user"

function createUserService({
  users,
  accessToken,
  projects,
  invitations,
  permissions,
}: {
  users: UsersRepo
  accessToken: AccessTokenRepo
  projects: ProjectsRepo
  invitations: InvitationsRepo
  permissions: PermissionsRepo
}) {
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
    const allowedProjects: string[] = permissionForUser.map((permission) =>
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

    const user = await users.getById(token?.userId)

    const invitation = await invitations.getCollection().findOne({
      token: invitationToken,
      projectId: ensureObjectId(projectId),
      userEmail: user?.email || "invalid",
      expires: { $gt: new Date() },
    })

    if (!invitation || !isActive(user)) {
      return false
    }

    await Promise.all([
      permissions.setReadPermissions(token.userId, projectId, "grant"),
      invitations.deleteInvitation(invitation._id),
    ])

    return true
  }

  return {
    getProjectsFromToken,
    acceptInvitation,
  }
}

const isActive = (user: null | WithId<UserWithPermissions>) => {
  return user && user.isActive
}

export default createUserService
