import jwt, { JwtPayload } from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import client from "./db/client";

const utils = {
  isAuthenticated: async (req: Request, res: Response, next: NextFunction) => {
    try {
      let token = req.headers["authorization"];
      if (token && token.startsWith("Bearer ")) token = token.slice(7);
      if (!token) {
        return res
          .status(401)
          .json({ error: { code: "UNAUTHORIZED", message: "Authentication required" } });
      }
      jwt.verify(token, process.env.TOKEN as string, (err, data) => {
        if (err || !data || typeof data === "string") {
          return res
            .status(401)
            .json({ error: { code: "UNAUTHORIZED", message: "Invalid or expired token" } });
        }
        req.userId = (data as JwtPayload).id;
        return next();
      });
    } catch (error) {
      return res
        .status(500)
        .json({ error: { code: "INTERNAL_ERROR", message: "Something went wrong" } });
    }
  },

  isUserLogged: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const isUserLoggedIn = await client.getUserStatus(req.userId);
      if (!isUserLoggedIn?.login_status) {
        return res
          .status(401)
          .json({ error: { code: "NOT_LOGGED_IN", message: "Please login first" } });
      }
      return next();
    } catch (error) {
      return res
        .status(500)
        .json({ error: { code: "INTERNAL_ERROR", message: "Something went wrong" } });
    }
  },
};

export default utils;
