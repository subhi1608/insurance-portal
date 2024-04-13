const crypto = require("crypto");
const client = require("./db/client");
const jwt = require("jsonwebtoken");

const utils = {
	createCipher: (req, res, next) => {
		// console.log("req", req.body.password);
		// const algorithm = "aes-256-cbc";
		// const key = crypto.scryptSync(req.body.password, "salt", 32);
		// const iv = Buffer.alloc(16, 0);

		// const cipher = crypto.createCipheriv(algorithm, key, iv);
		// let encrypted = cipher.update(req.body.password, "utf8", "hex");
		// encrypted += cipher.final("hex");
		// console.log(encrypted, "encrypted");
		// req.body.password = encrypted;

		// const decipher = crypto.createDecipheriv(algorithm, key, iv);
		// let decrypted = decipher.update(encrypted, "hex", "utf8");
		// decrypted += decipher.final("utf8");
		// console.log(decrypted, "decrypted"); // outputs the decrypted data
		next();
	},
	decryptCipher: async (req, res, next) => {
		try {
			const isUserValid = await client.getUserByEmail(
				req.body.email,
				req.body.password
			);
			// if (isUserValid?.login_status)
			// 	await clientService.logoutUser()
			if (isUserValid?.id) {
				req.userId = isUserValid.id;
				return next();
			} else return res.json({ message: "user record not found!!" });
		} catch (error) {
			return error;
		}
	},
	isAuthenticated: async (req, res, next) => {
		try {
			let token = req.headers["authentication"];
			if (token && token.startsWith("Bearer"))
				token = token.slice(7, token.length);
			if (token) {
				jwt.verify(token, process.env.TOKEN, (err, data) => {
					if (err) {
						return res.json({
							success: false,
							code: 401,
							message: "Unauthorized",
						});
					} else {
						req.userId = data.id;
						return next();
					}
				});
			} else
				return res.json({
					success: false,
					code: 400,
					message: "Bad request",
				});
		} catch (error) {
			return error;
		}
	},
	isUserLogged: async (req, res, next) => {
		try {
			const isUserLoggedIn = await client.getUserStatus(req.userId);
			if (!isUserLoggedIn?.login_status)
				return res.json({ message: "please login first" });
			return next();
		} catch (error) {
			return error;
		}
	},
};

module.exports = utils;
