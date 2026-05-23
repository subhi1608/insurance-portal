import "dotenv/config";
import createError from "http-errors";
import express, { Request, Response, NextFunction } from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors";
import { AppError } from "./api/v1/errors";
import db from "./api/v1/db/index";
import api from "./api/index";

const app = express();

const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow all origins when ALLOWED_ORIGINS is not configured (dev fallback)
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Serve built React client (production)
app.use(express.static(path.join(__dirname, "../client/dist")));

app.get("/health", async (req: Request, res: Response) => {
  try {
    await db.checkHealth();
    return res
      .status(200)
      .json({ status: "ok", db: "ok", uptime: Math.floor(process.uptime()) });
  } catch {
    return res
      .status(503)
      .json({ status: "error", db: "error", uptime: Math.floor(process.uptime()) });
  }
});

app.use("/api", api);

// Catch-all: send React's index.html for any non-API route (supports client-side routing)
app.get("*", (_req: Request, res: Response, next: NextFunction) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"), (err) => {
    if (err) next(); // Falls through to 404 handler in development (no build yet)
  });
});

app.use((req: Request, res: Response, next: NextFunction) => {
  next(createError(404));
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res
      .status(err.statusCode)
      .json({ error: { code: err.code, message: err.message } });
  }
  const status = err.status || err.statusCode || 500;
  const message = process.env.NODE_ENV === "production" ? "Something went wrong" : err.message;
  return res.status(status).json({ error: { code: "INTERNAL_ERROR", message } });
});

export default app;
