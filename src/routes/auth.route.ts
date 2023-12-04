import express from "express";
import { registerHandler } from "../controllers/auth.controller";
import { validate } from "../middleware/validate";
import { createUserSchema } from "../schema/user.schema";

const router = express.Router();

// Register user route
router.post("/register", validate(createUserSchema), registerHandler);

export default router;
