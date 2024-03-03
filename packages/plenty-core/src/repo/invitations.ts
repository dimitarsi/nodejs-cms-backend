import { ObjectId, type Db } from "mongodb"
import type Invitation from "~/models/invitation"
import { getInvitationExpirationDate } from "~/helpers/date"
import { ensureObjectId } from "~/helpers/objectid"
import { v4 } from "uuid"

export default function invitations(db: Db) {
  const collection = db.collection<Invitation>("invitations")

  return {
    getCollection() {
      return collection
    },
    async create(data: Omit<Invitation, "token" | "expires">) {
      return collection.insertOne({
        userEmail: data.userEmail,
        projectId: ensureObjectId(data.projectId),
        expires: getInvitationExpirationDate(),
        token: v4(),
      })
    },
    async deleteInvitation(invitationId: string | ObjectId) {
      return collection.deleteOne({ _id: ensureObjectId(invitationId) })
    },
    async getAllInvitationForProject(projectId: Invitation["projectId"]) {
      const cursor = await collection.find({
        projectId: ensureObjectId(projectId),
      })

      return cursor.toArray()
    },
    async deleteInvitationForUser(
      userEmail: string,
      projectId: string | ObjectId
    ) {
      return await collection.deleteMany({
        userEmail,
        projectId: ensureObjectId(projectId),
      })
    },
  }
}
