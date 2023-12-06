import { NextFunction, Request, Response } from "express";
import { CreateUserInput } from "../schema/user.schema";
import { createUser } from "../services/user.service";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { omit } from "lodash";

export const excludedFields = ["password"];

export const registerHandler = async (
  req: Request<{}, {}, CreateUserInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 12);
    const user = await createUser({
      firstName: req.body.firstName,
      lastName: req.body.firstName,
      email: req.body.email,
      password: hashedPassword,
    });

    const newUser = omit(user, excludedFields);

    res.status(201).json({
      status: "success",
      data: {
        user: newUser,
      },
    });
  } catch (err: any) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        return res.status(409).json({
          status: "fail",
          message: "Email already exist, please use another email address",
        });
      }
    }
    next(err);
  }
};
