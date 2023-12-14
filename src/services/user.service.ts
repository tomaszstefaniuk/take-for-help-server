import { Prisma, User } from "@prisma/client";
import config from "config";
import redisClient from "../utils/connectRedis";
import { signJwt } from "../utils/jwt";
import db from "../utils/db";

export const excludedFields = ["password"];

export const createUser = async (input: Prisma.UserCreateInput) => {
  return (await db.user.create({
    data: input,
  })) as User;
};

export const findUniqueUser = async (
  where: Prisma.UserWhereUniqueInput,
  select?: Prisma.UserSelect
) => {
  return (await db.user.findUnique({
    where,
    select,
  })) as User;
};

export const signTokens = async (user: Prisma.UserCreateInput) => {
  // Create Session
  redisClient.set(`${user.id}`, JSON.stringify(user), {
    EX: config.get<number>("redisCacheExpiresIn") * 60,
  });

  // Create Access and Refresh tokens
  const access_token = signJwt(
    { sub: user.id },
    {
      expiresIn: `${config.get<number>("accessTokenExpiresIn")}m`,
    }
  );

  const refresh_token = signJwt(
    { sub: user.id },
    {
      expiresIn: `${config.get<number>("refreshTokenExpiresIn")}m`,
    }
  );

  return { access_token, refresh_token };
};
