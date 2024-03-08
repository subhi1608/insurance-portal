"use strict";
const express = require("express");
const clientService = require("../Services/clientService");
const utils = require("../utils");
const router = express.Router();

router.route("/signin").post(utils.createCipher, async (req, res, next) => {
	try {
		const data = await clientService.createUser(Object.assign({}, req.body));
		return res.status(200).json(data);
	} catch (error) {
		return res.json(error);
	}
});

router.route("/login").post(utils.decryptCipher, async (req, res, next) => {
	try {
		const data = await clientService.loginUser(req.userId);
		return res.status(200).json(data);
	} catch (error) {
		return res.json(error);
	}
});

module.exports = router;
