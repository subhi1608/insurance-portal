import express, { Request, Response } from "express";
import type { CookieOptions } from "express";
import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import connection from "../../../queue/connection";
import clientService from "../Services/clientService";
import utils from "../utils";
import { validate } from "../middlewares/validations";
import { authSigninSchema, authLoginSchema } from "../schemas";

const authRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: { code: "TOO_MANY_REQUESTS", message: "Too many requests, please try again later" } },
  store: new RedisStore({
    sendCommand: (...args: string[]) => (connection as any).call(...args),
  }),
});

const router = express.Router();

const REFRESH_COOKIE = "refreshToken";
const COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const isTokenPair = (
  value: unknown
): value is { accessToken: string; refreshToken: string } =>
  !!value && typeof value === "object" && "accessToken" in value;

router.route("/signin").post(authRateLimit, validate(authSigninSchema), async (req: Request, res: Response) => {
  try {
    const result = await clientService.createUser(req.body);
    if (!isTokenPair(result)) {
      return res
        .status(400)
        .json({ error: { code: "SIGNUP_FAILED", message: "Could not create user" } });
    }
    res.cookie(REFRESH_COOKIE, result.refreshToken, COOKIE_OPTIONS);
    return res.status(201).json({ data: { accessToken: result.accessToken } });
  } catch (error) {
    return res
      .status(500)
      .json({ error: { code: "INTERNAL_ERROR", message: "Something went wrong" } });
  }
});

router.route("/login").post(authRateLimit, validate(authLoginSchema), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await clientService.loginUser(email, password);
    if (!isTokenPair(result)) {
      return res
        .status(401)
        .json({ error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" } });
    }
    res.cookie(REFRESH_COOKIE, result.refreshToken, COOKIE_OPTIONS);
    return res.status(200).json({ data: { accessToken: result.accessToken } });
  } catch (error) {
    return res
      .status(500)
      .json({ error: { code: "INTERNAL_ERROR", message: "Something went wrong" } });
  }
});

router.route("/refresh").post(async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies[REFRESH_COOKIE];
    if (!refreshToken) {
      return res
        .status(401)
        .json({ error: { code: "NO_REFRESH_TOKEN", message: "Refresh token required" } });
    }
    const result = await clientService.refreshAccessToken(refreshToken);
    if (!result) {
      return res.status(401).json({
        error: { code: "INVALID_REFRESH_TOKEN", message: "Invalid or expired refresh token" },
      });
    }
    return res.status(200).json({ data: result });
  } catch (error) {
    return res
      .status(500)
      .json({ error: { code: "INTERNAL_ERROR", message: "Something went wrong" } });
  }
});

router.route("/logout").post(utils.isAuthenticated, async (req: Request, res: Response) => {
  try {
    await clientService.logoutUser(req.userId as number);
    res.clearCookie(REFRESH_COOKIE, COOKIE_OPTIONS);
    return res.status(200).json({ data: { message: "Logged out successfully" } });
  } catch (error) {
    return res
      .status(500)
      .json({ error: { code: "INTERNAL_ERROR", message: "Something went wrong" } });
  }
});

export default router;
