import { Prisma, User } from "@prisma/client";
import config from "config";
import redisClient from "../utils/connectRedis";
import db from "../utils/db";
import { signJwt } from "../utils/jwt";

export const excludedFields = [
  "password",
  "verified",
  "passwordResetAt",
  "passwordResetToken",
];

export const createUser = async (input: Prisma.UserCreateInput) => {
  return (await db.user.create({
    data: input,
  })) as User;
};

export const findUser = async (
  where: Partial<Prisma.UserWhereInput>,
  select?: Prisma.UserSelect
) => {
  return (await db.user.findFirst({
    where,
    select,
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

export const updateUser = async (
  where: Prisma.UserWhereUniqueInput,
  data: Prisma.UserUpdateInput,
  select: Prisma.UserSelect
) => {
  return await db.user.update({ where, data, select });
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

export const createOrUpdateUser = async (
  where: Prisma.UserWhereUniqueInput,
  data: Prisma.UserUpdateInput
) => {
  const createData: Prisma.UserCreateInput = {
    email: String(data.email),
    firstName: String(data.firstName),
    lastName: String(data.lastName),
    password: data.password !== undefined ? String(data.password) : "",
    provider: String(data.provider),
  };

  return await db.user.upsert({
    where,
    update: data,
    create: createData,
  });
};
