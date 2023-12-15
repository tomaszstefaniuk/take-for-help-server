import express from "express";
import {
  registerHandler,
  loginUserHandler,
  logoutUserHandler,
  refreshAccessTokenHandler,
} from "../controllers/auth.controller";
import { deserializeUser } from "../middleware/deserializeUser";
import { requireUser } from "../middleware/requireUser";
import { validate } from "../middleware/validate";
import { loginUserSchema, createUserSchema } from "../schema/user.schema";

const router = express.Router();

router.post("/register", validate(createUserSchema), registerHandler);

router.post("/login", validate(loginUserSchema), loginUserHandler);

router.get("/refresh", refreshAccessTokenHandler);

router.get("/logout", deserializeUser, requireUser, logoutUserHandler);

export default router;
