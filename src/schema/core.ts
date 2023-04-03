import Ajv from "ajv"
import addFormats from "ajv-formats"
import checkIfExists from "./checkIfExists"

const ajv = new Ajv()

addFormats(ajv)

ajv.addKeyword({
  keyword: "found",
  async: true,
  type: "string",
  validate: checkIfExists,
})

export default ajv
