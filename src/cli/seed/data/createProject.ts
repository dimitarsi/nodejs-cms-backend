import type { ObjectId } from "mongodb"
import type { DomainSettings } from "~/models/project"

const defaultCreateProjectPayload = {
  name: "Main Project",
  active: true,
  domains: [
    {
      host: "http://localhost:5000",
      defaultLocale: "en_EN",
      supportedLanguages: ["en"],
    },
  ] as DomainSettings[],
  // owner: "", // Ref to use
}

export const createProjectPayload = (userId: ObjectId) => {
  return {
    ...defaultCreateProjectPayload,
    owner: userId.toString(),
  }
}

export default defaultCreateProjectPayload
