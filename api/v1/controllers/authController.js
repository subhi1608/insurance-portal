"use strict";
const express = require("express");
const clientService = require("../Services/clientService");
const utils = require("../utils");
const { validate } = require("../middlewares/validations");
const { authSigninSchema, authLoginSchema } = require("../schemas");
const router = express.Router();

const REFRESH_COOKIE = "refreshToken";
const COOKIE_OPTIONS = {
	httpOnly: true,
	secure: process.env.NODE_ENV === "production",
	sameSite: "strict",
	maxAge: 7 * 24 * 60 * 60 * 1000,
};

router.route("/signin").post(validate(authSigninSchema), async (req, res) => {
	try {
		const result = await clientService.createUser(req.body);
		if (!result || result instanceof Error) {
			return res.status(400).json({ error: { code: "SIGNUP_FAILED", message: "Could not create user" } });
		}
		res.cookie(REFRESH_COOKIE, result.refreshToken, COOKIE_OPTIONS);
		return res.status(201).json({ data: { accessToken: result.accessToken } });
	} catch (error) {
		return res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Something went wrong" } });
	}
});

router.route("/login").post(validate(authLoginSchema), async (req, res) => {
	try {
		const { email, password } = req.body;
		const result = await clientService.loginUser(email, password);
		if (!result) {
			return res.status(401).json({ error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" } });
		}
		res.cookie(REFRESH_COOKIE, result.refreshToken, COOKIE_OPTIONS);
		return res.status(200).json({ data: { accessToken: result.accessToken } });
	} catch (error) {
		return res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Something went wrong" } });
	}
});

router.route("/refresh").post(async (req, res) => {
	try {
		const refreshToken = req.cookies[REFRESH_COOKIE];
		if (!refreshToken) {
			return res.status(401).json({ error: { code: "NO_REFRESH_TOKEN", message: "Refresh token required" } });
		}
		const result = await clientService.refreshAccessToken(refreshToken);
		if (!result) {
			return res.status(401).json({ error: { code: "INVALID_REFRESH_TOKEN", message: "Invalid or expired refresh token" } });
		}
		return res.status(200).json({ data: result });
	} catch (error) {
		return res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Something went wrong" } });
	}
});

router.route("/logout").post(utils.isAuthenticated, async (req, res) => {
	try {
		await clientService.logoutUser(req.userId);
		res.clearCookie(REFRESH_COOKIE, COOKIE_OPTIONS);
		return res.status(200).json({ data: { message: "Logged out successfully" } });
	} catch (error) {
		return res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Something went wrong" } });
	}
});

module.exports = router;
