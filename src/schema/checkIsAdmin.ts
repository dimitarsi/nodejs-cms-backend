import { SchemaValidateFunction } from 'ajv';
import { findToken } from './../repo/accessTokens';

export const checkIsAdmin: SchemaValidateFunction = async (
  schema: {},
  data: string
) => {
  const token = await findToken(data)

  return token?.isAdmin
}