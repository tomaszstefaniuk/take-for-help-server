import express from "express";
import { googleOauthHandler } from "../controllers/auth.controller";

const sessionRouter = express.Router();

sessionRouter.get("/oauth/google", googleOauthHandler);

export default sessionRouter;
