import { object, string, TypeOf, z } from "zod";

enum RoleEnumType {
  ADMIN = "admin",
  USER = "user",
}

export const createUserSchema = object({
  body: object({
    firstName: string({ required_error: "First Name is required" }),
    lastName: string({ required_error: "Last Name is required" }),
    email: string({ required_error: "Email address is required" }).email(
      "Invalid email address"
    ),
    password: string({ required_error: "Password is required" })
      .min(8, "Password must be more than 8 characters")
      .max(100, "Password must be less than 100 characters"),
    passwordConfirm: string({ required_error: "Please confirm your password" }),
    role: z.optional(z.nativeEnum(RoleEnumType)),
  }).refine((data) => data.password === data.passwordConfirm, {
    path: ["passwordConfirm"],
    message: "Passwords do not match",
  }),
});

export const loginUserSchema = object({
  body: object({
    email: string({
      required_error: "Email address is required",
    }).email("Invalid email address"),
    password: string({ required_error: "Password is required" })
      .min(8, "Password must be more than 8 characters")
      .max(100, "Password must be less than 100 characters"),
  }),
});

export const forgotPasswordSchema = object({
  body: object({
    email: string({
      required_error: "Email address is required",
    }).email("Email address is invalid"),
  }),
});

export const resetPasswordSchema = object({
  params: object({
    resetToken: string(),
  }),
  body: object({
    password: string({ required_error: "Password is required" })
      .min(8, "Password must be more than 8 characters")
      .max(100, "Password must be less than 100 characters"),
    passwordConfirm: string({ required_error: "Please confirm your password" }),
  }).refine((data) => data.password === data.passwordConfirm, {
    path: ["passwordConfirm"],
    message: "Passwords do not match",
  }),
});

export type CreateUserInput = TypeOf<typeof createUserSchema>["body"];
export type LoginUserInput = TypeOf<typeof loginUserSchema>["body"];

export type ForgotPasswordInput = TypeOf<typeof forgotPasswordSchema>["body"];
export type ResetPasswordInput = TypeOf<typeof resetPasswordSchema>;
