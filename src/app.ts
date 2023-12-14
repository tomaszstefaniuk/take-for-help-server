require("dotenv").config();
import express, { NextFunction, Request, Response } from "express";
import morgan from "morgan";
import config from "config";
import cors from "cors";
import authRouter from "./routes/auth.routes";
import userRouter from "./routes/user.routes";
import cookieParser from "cookie-parser";
import validateEnv from "./utils/validateEnv";

validateEnv();

const app = express();

async function bootstrap() {
  // Body Parser
  app.use(express.json({ limit: "10kb" }));

  // Cookie Parser
  app.use(cookieParser());

  // Logger
  if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

  // Cors
  app.use(
    cors({
      origin: config.get<string>("origin"),
      credentials: true,
    })
  );

  // Routes
  app.use("/api/auth", authRouter);
  app.use("/api/users", userRouter);

  // UnKnown Routes
  app.all("*", (req: Request, res: Response, next: NextFunction) => {
    const err = new Error(`Route ${req.originalUrl} not found`) as any;
    err.statusCode = 404;
    next(err);
  });

  // Global Error Handler
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    err.status = err.status || "error";
    err.statusCode = err.statusCode || 500;

    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  });

  const port = config.get<number>("port");
  app.listen(port, () => {
    console.log(`Server on port: ${port}`);
  });
}

bootstrap();
