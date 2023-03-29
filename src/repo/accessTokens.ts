import { Collection, ObjectId } from "mongodb";
import db from "../connect/db";
import { randomUUID } from "crypto";
import { loginSession } from "../config/config";


const getExpirationDate = () => {
  return new Date(Date.now() + loginSession);
}

export interface AccessToken {
  token: string;
  expire: Date;
  userId: string;
  isActive: boolean;
}

export const findOrCreateAccessToken = async (userId: string) => {
  const activeToken = await db.collection<AccessToken>("accessTokens").findOne({
    userId,
    expire: {$gt: new Date()},
    isActive: true,
  });

  if(activeToken) {
    return activeToken.token
  }

  const accessToken = randomUUID();

  await db.collection<AccessToken>("accessTokens").insertOne({
    token: accessToken,
    expire: getExpirationDate(),
    userId,
    isActive: true,
  });

  return accessToken
}

export const deactivateToken = async (accessToken: string) => {
  const data = await db.collection<AccessToken>('accessTokens').updateOne({
    token: accessToken,
    expire: {$gt: new Date()},
    isActive: true
  }, {
    $set: {isActive: false}
  })

  return data.modifiedCount > 0
}