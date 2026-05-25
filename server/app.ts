import "dotenv/config";
import createError from "http-errors";
import express, { Request, Response, NextFunction } from "express";
import path from "path";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import pino from "pino";
import pinoHttp from "pino-http";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { AppError } from "./api/v1/errors";
import db from "./api/v1/db/index";
import connection from "./queue/connection";
import api from "./api/index";
import spec from "./openapi";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  ...(process.env.NODE_ENV !== "production" && {
    transport: { target: "pino-pretty", options: { colorize: true } },
  }),
});

const app = express();

const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(pinoHttp({ logger }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Serve built React client (production)
app.use(express.static(path.join(__dirname, "../client/dist")));

app.get("/health", async (_req: Request, res: Response) => {
  const [dbResult, redisResult] = await Promise.allSettled([
    db.checkHealth(),
    connection.ping(),
  ]);
  const dbOk = dbResult.status === "fulfilled";
  const redisOk = redisResult.status === "fulfilled";
  const httpStatus = dbOk ? 200 : 503;
  return res.status(httpStatus).json({
    status: dbOk ? "ok" : "error",
    db: dbOk ? "ok" : "error",
    redis: redisOk ? "ok" : "error",
    uptime: Math.floor(process.uptime()),
  });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(spec));
app.use("/api", api);

// Catch-all: send React's index.html for any non-API route
app.get("*", (_req: Request, res: Response, next: NextFunction) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"), (err) => {
    if (err) next();
  });
});

app.use((req: Request, res: Response, next: NextFunction) => {
  next(createError(404));
});

app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    return res
      .status(err.statusCode)
      .json({ error: { code: err.code, message: err.message } });
  }
  const status = err.status || err.statusCode || 500;
  const message =
    process.env.NODE_ENV === "production" ? "Something went wrong" : err.message;
  return res.status(status).json({ error: { code: "INTERNAL_ERROR", message } });
});

export default app;
