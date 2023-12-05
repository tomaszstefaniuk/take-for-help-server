import { object, string, TypeOf, z } from "zod";

enum RoleEnumType {
  ADMIN = "admin",
  USER = "user",
}

export const createUserSchema = object({
  body: object({
    firstName: string({ required_error: "First Name is required" }),
    lastName: string({ required_error: "Last Name is required" }),
    email: string({ required_error: "Email is required" }).email(
      "Invalid email"
    ),
    password: string({ required_error: "Password is required" })
      .min(8, "Password must be more than 8 characters")
      .max(32, "Password must be less than 32 characters"),
    passwordConfirm: string({ required_error: "Please confirm your password" }),
    role: z.optional(z.nativeEnum(RoleEnumType)),
  }).refine((data) => data.password === data.passwordConfirm, {
    path: ["passwordConfirm"],
    message: "Passwords do not match",
  }),
});

export type CreateUserInput = TypeOf<typeof createUserSchema>["body"];
