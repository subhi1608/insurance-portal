require("dotenv").config({ path: ".env" });

const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const { AppError } = require("./api/v1/errors");
const db = require("./api/v1/db/index");

const api = require("./api/index");

const app = express();
const PORT = process.env.PORT || 8000;

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.get("/health", async (req, res) => {
  try {
    await db.checkHealth();
    return res.status(200).json({ status: "ok", db: "ok", uptime: Math.floor(process.uptime()) });
  } catch {
    return res.status(503).json({ status: "error", db: "error", uptime: Math.floor(process.uptime()) });
  }
});

app.use("/api", api);

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: { code: err.code, message: err.message } });
  }
  const status = err.status || err.statusCode || 500;
  const message = process.env.NODE_ENV === "production" ? "Something went wrong" : err.message;
  return res.status(status).json({ error: { code: "INTERNAL_ERROR", message } });
});

app.listen(PORT, () => {
  console.log(`Server running at PORT ${PORT}`);
});
module.exports = app;
