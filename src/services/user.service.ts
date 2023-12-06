import { PrismaClient, Prisma, User } from "@prisma/client";

const prisma = new PrismaClient();

// CreateUser service
export const createUser = async (input: Prisma.UserCreateInput) => {
  return (await prisma.user.create({
    data: input,
  })) as User;
};
