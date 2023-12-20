import crypto from "crypto";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import config from "config";
import { NextFunction, Request, Response } from "express";
import { omit } from "ramda";
import {
  LoginUserInput,
  CreateUserInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "../schemas/user.schema";
import {
  createUser,
  excludedFields,
  findUniqueUser,
  findUser,
  signTokens,
  updateUser,
} from "../services/user.service";
import AppError from "../utils/appError";
import redisClient from "../utils/connectRedis";
import {
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
} from "../utils/cookies";
import Email from "../utils/email";
import { signJwt, verifyJwt } from "../utils/jwt";

export const registerHandler = async (
  req: Request<object, object, CreateUserInput>,
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

    const newUser = omit(excludedFields, user);

    res.status(201).json({
      status: "success",
      data: {
        user: newUser,
      },
    });
  } catch (err: unknown) {
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

export const loginUserHandler = async (
  req: Request<object, object, LoginUserInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    const user = await findUniqueUser(
      { email: email.toLowerCase() },
      { id: true, email: true, verified: true, password: true }
    );

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(new AppError(400, "Invalid email or password"));
    }

    // Sign Tokens
    const { access_token, refresh_token } = await signTokens(user);
    res.cookie("access_token", access_token, accessTokenCookieOptions);
    res.cookie("refresh_token", refresh_token, refreshTokenCookieOptions);
    res.cookie("logged_in", true, {
      ...accessTokenCookieOptions,
      httpOnly: false,
    });

    res.status(200).json({
      status: "success",
      access_token,
    });
  } catch (err: unknown) {
    next(err);
  }
};

export const refreshAccessTokenHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refresh_token = req.cookies.refresh_token;

    const message = "Could not refresh access token";

    if (!refresh_token) {
      throw new AppError(403, message);
    }

    // Validate refresh token
    const decoded = verifyJwt<{ sub: string }>(refresh_token);

    if (!decoded) {
      throw new AppError(403, message);
    }

    // Check if user has a valid session
    const session = await redisClient.get(decoded.sub);

    if (!session) {
      throw new AppError(403, message);
    }

    // Check if user still exist
    const user = await findUniqueUser({ id: JSON.parse(session).id });

    if (!user) {
      throw new AppError(403, message);
    }

    // Sign new access token
    const access_token = signJwt(
      { sub: user.id },
      {
        expiresIn: `${config.get<number>("accessTokenExpiresIn")}m`,
      }
    );

    // Add Cookies
    res.cookie("access_token", access_token, accessTokenCookieOptions);
    res.cookie("logged_in", true, {
      ...accessTokenCookieOptions,
      httpOnly: false,
    });

    // Send response
    res.status(200).json({
      status: "success",
      access_token,
    });
  } catch (err: unknown) {
    next(err);
  }
};

const logout = (res: Response) => {
  res.cookie("access_token", "", { maxAge: -1 });
  res.cookie("refresh_token", "", { maxAge: -1 });
  res.cookie("logged_in", "", { maxAge: -1 });
};

export const logoutUserHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await redisClient.del(res.locals.user.id);
    logout(res);

    res.status(200).json({
      status: "success",
    });
  } catch (err: unknown) {
    next(err);
  }
};

export const forgotPasswordHandler = async (
  req: Request<
    Record<string, never>,
    Record<string, never>,
    ForgotPasswordInput
  >,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get the user from the collection
    const user = await findUser({ email: req.body.email.toLowerCase() });
    const message =
      "You will receive a reset email if user with that email exist";
    if (!user) {
      return res.status(200).json({
        status: "success",
        message,
      });
    }

    if (!user.verified) {
      return res.status(403).json({
        status: "fail",
        message: "Account not verified",
      });
    }

    if (user.provider) {
      return res.status(403).json({
        status: "fail",
        message:
          "We found your account. It looks like you registered with a social auth account. Try signing in with social auth.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    await updateUser(
      { id: user.id },
      {
        passwordResetToken,
        passwordResetAt: new Date(Date.now() + 10 * 60 * 1000),
      },
      { email: true }
    );

    try {
      const url = `${config.get<string>(
        "origin"
      )}/reset-password/${resetToken}`;
      await new Email(user, url).sendPasswordResetToken();
      res.status(200).json({
        status: "success",
        message,
      });
    } catch (err: unknown) {
      await updateUser(
        { id: user.id },
        { passwordResetToken: null, passwordResetAt: null },
        { email: true }
      );

      return res.status(500).json({
        status: "error",
        message: "There was an error sending email",
      });
    }
  } catch (err: unknown) {
    next(err);
  }
};

export const resetPasswordHandler = async (
  req: Request<
    ResetPasswordInput["params"],
    Record<string, never>,
    ResetPasswordInput["body"]
  >,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get the user from the collection
    const passwordResetToken = crypto
      .createHash("sha256")
      .update(req.params.resetToken)
      .digest("hex");

    const user = await findUser({
      passwordResetToken,
      passwordResetAt: {
        gt: new Date(),
      },
    });

    if (!user) {
      return res.status(403).json({
        status: "fail",
        message: "Invalid token or token has expired",
      });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 12);
    // Change password data
    await updateUser(
      {
        id: user.id,
      },
      {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetAt: null,
      },
      { email: true }
    );

    logout(res);
    res.status(200).json({
      status: "success",
      message: "Password data updated successfully",
    });
  } catch (err: unknown) {
    next(err);
  }
};
