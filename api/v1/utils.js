const client = require("./db/client");
const jwt = require("jsonwebtoken");

const utils = {
	isAuthenticated: async (req, res, next) => {
		try {
			let token = req.headers["authorization"];
			if (token && token.startsWith("Bearer "))
				token = token.slice(7);
			if (!token) {
				return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Authentication required" } });
			}
			jwt.verify(token, process.env.TOKEN, (err, data) => {
				if (err) {
					return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Invalid or expired token" } });
				}
				req.userId = data.id;
				return next();
			});
		} catch (error) {
			return res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Something went wrong" } });
		}
	},
	isUserLogged: async (req, res, next) => {
		try {
			const isUserLoggedIn = await client.getUserStatus(req.userId);
			if (!isUserLoggedIn?.login_status) {
				return res.status(401).json({ error: { code: "NOT_LOGGED_IN", message: "Please login first" } });
			}
			return next();
		} catch (error) {
			return res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Something went wrong" } });
		}
	},
};

module.exports = utils;
