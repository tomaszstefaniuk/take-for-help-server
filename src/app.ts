import "dotenv/config";
import config from "config";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import morgan from "morgan";
import authRouter from "./routes/auth.routes";
import userRouter from "./routes/user.routes";
import AppError from "./utils/appError";
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
    const err = new AppError(404, `Route ${req.originalUrl} not found`);
    next(err);
  });

  // Global Error Handler
  app.use((err: AppError, req: Request, res: Response) => {
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
