import { omit } from "lodash";
import userModel, { User } from "../models/user.model";
import { excludedFields } from "../controllers/auth.controller";

// CreateUser service
export const createUser = async (input: Partial<User>) => {
  const user = await userModel.create(input);
  return omit(user.toJSON(), excludedFields);
};
