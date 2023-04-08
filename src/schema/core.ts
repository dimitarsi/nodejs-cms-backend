import Ajv from "ajv"
import addFormats from "ajv-formats"
import { checkIfExists } from "./checkIfExists"
import { checkIsAdmin } from "./checkIsAdmin"

const ajv = new Ajv({
  allowUnionTypes: true,
})

addFormats(ajv)

ajv.addKeyword({
  keyword: "found",
  async: true,
  type: "string",
  validate: checkIfExists,
})

export default ajv
